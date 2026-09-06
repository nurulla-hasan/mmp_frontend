import { unzipSync } from "fflate";
import { type GeoPoint, type KmzData, type KmzTile } from "../types";

export async function parseKmzFile(file: File): Promise<KmzData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error("Failed to read file");
        }

        const unzippedFiles = unzipSync(new Uint8Array(arrayBuffer));

        const kmlFileKey = Object.keys(unzippedFiles).find(
          (key) => key.toLowerCase().endsWith(".kml")
        );
        const kmlFile = kmlFileKey ? unzippedFiles[kmlFileKey] : null;

        if (!kmlFile) {
          throw new Error("No KML file found in KMZ");
        }

        const decoder = new TextDecoder("utf-8");
        const kmlText = decoder.decode(kmlFile);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(kmlText, "text/xml");

        const nameNode =
          xmlDoc.getElementsByTagNameNS("*", "name")[0] ||
          xmlDoc.getElementsByTagName("name")[0];
        const documentName = nameNode?.textContent?.trim() || "KMZ Map";

        let groundOverlays = Array.from(
          xmlDoc.getElementsByTagNameNS("*", "GroundOverlay")
        );
        if (groundOverlays.length === 0) {
          groundOverlays = Array.from(
            xmlDoc.getElementsByTagName("GroundOverlay")
          );
        }

        if (groundOverlays.length === 0) {
          throw new Error("No GroundOverlays found in KMZ");
        }

        const tiles: KmzTile[] = [];

        for (const overlay of groundOverlays) {
          const iconNode =
            overlay.getElementsByTagNameNS("*", "Icon")[0] ||
            overlay.getElementsByTagName("Icon")[0];
          
          let href = "";
          if (iconNode) {
            const hrefNode =
              iconNode.getElementsByTagNameNS("*", "href")[0] ||
              iconNode.getElementsByTagName("href")[0];
            href = hrefNode?.textContent?.trim() || "";
          }

          if (!href) continue;

          // Normalize path for matching inside zip archive
          const cleanHref = href.replace(/^[./\\]+/, "").replace(/\\/g, "/");

          const fileKey = Object.keys(unzippedFiles).find((k) => {
            const cleanK = k.replace(/^[./\\]+/, "").replace(/\\/g, "/");
            return (
              cleanK.toLowerCase() === cleanHref.toLowerCase() ||
              cleanK.toLowerCase().endsWith("/" + cleanHref.toLowerCase()) ||
              cleanHref.toLowerCase().endsWith("/" + cleanK.toLowerCase()) ||
              cleanK.toLowerCase().endsWith(cleanHref.toLowerCase())
            );
          });

          const imageBuffer = fileKey ? unzippedFiles[fileKey] : null;
          if (!imageBuffer) {
            console.warn(`Image file not found in KMZ: ${href}`);
            continue;
          }

          // Create object URL for the image
          let mimeType = "image/png";
          if (
            href.toLowerCase().endsWith(".jpg") ||
            href.toLowerCase().endsWith(".jpeg")
          ) {
            mimeType = "image/jpeg";
          }
          const blob = new Blob([imageBuffer], { type: mimeType });
          const url = URL.createObjectURL(blob);

          // Get image dimensions safely
          const dimensions = await new Promise<{ width: number; height: number }>(
            (res) => {
              const img = new Image();
              img.onload = () =>
                res({
                  width: img.naturalWidth || img.width,
                  height: img.naturalHeight || img.height,
                });
              img.onerror = () => res({ width: 2048, height: 2048 });
              img.src = url;
              if (img.complete && img.naturalWidth > 0) {
                res({ width: img.naturalWidth, height: img.naturalHeight });
              }
            }
          );

          // Parse coordinates
          let corners: [GeoPoint, GeoPoint, GeoPoint, GeoPoint] | null = null;

          const latLonQuad =
            overlay.getElementsByTagNameNS("*", "LatLonQuad")[0] ||
            overlay.getElementsByTagName("gx:LatLonQuad")[0] ||
            overlay.getElementsByTagName("LatLonQuad")[0];

          if (latLonQuad) {
            const coordsNode =
              latLonQuad.getElementsByTagNameNS("*", "coordinates")[0] ||
              latLonQuad.getElementsByTagName("coordinates")[0];
            const coordsText = coordsNode?.textContent;
            if (coordsText) {
              const pairs = coordsText.trim().split(/\s+/);
              const parsed: GeoPoint[] = [];
              for (const pair of pairs) {
                const parts = pair.split(",").map(Number);
                if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                  // In KML coordinates: lon,lat,alt
                  parsed.push({ lng: parts[0], lat: parts[1] });
                }
              }
              if (parsed.length >= 4) {
                // KML LatLonQuad order: Bottom-Left, Bottom-Right, Top-Right, Top-Left
                corners = [parsed[0], parsed[1], parsed[2], parsed[3]];
              }
            }
          }

          if (!corners) {
            // Try LatLonBox fallback
            const latLonBox =
              overlay.getElementsByTagNameNS("*", "LatLonBox")[0] ||
              overlay.getElementsByTagName("LatLonBox")[0];

            if (latLonBox) {
              const getVal = (tag: string) => {
                const node =
                  latLonBox.getElementsByTagNameNS("*", tag)[0] ||
                  latLonBox.getElementsByTagName(tag)[0];
                return Number(node?.textContent);
              };

              const north = getVal("north");
              const south = getVal("south");
              const east = getVal("east");
              const west = getVal("west");

              if (
                !isNaN(north) &&
                !isNaN(south) &&
                !isNaN(east) &&
                !isNaN(west)
              ) {
                corners = [
                  { lat: south, lng: west }, // Bottom-Left
                  { lat: south, lng: east }, // Bottom-Right
                  { lat: north, lng: east }, // Top-Right
                  { lat: north, lng: west }, // Top-Left
                ];
              }
            }
          }

          if (corners) {
            tiles.push({
              url,
              corners,
              width: dimensions.width,
              height: dimensions.height,
            });
          }
        }

        if (tiles.length === 0) {
          throw new Error("Could not parse image tiles or coordinates from KMZ");
        }

        resolve({ name: documentName, tiles });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsArrayBuffer(file);
  });
}
