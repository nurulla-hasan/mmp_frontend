type PixelJob = {
  buffer: ArrayBuffer;
  sensitivity: number;
  lineColor: { r: number; g: number; b: number };
};

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<PixelJob>) => void) | null;
  postMessage: (message: unknown, transfer: Transferable[]) => void;
};

workerScope.onmessage = (event: MessageEvent<PixelJob>) => {
  const { buffer, sensitivity, lineColor } = event.data;
  const data = new Uint8ClampedArray(buffer);
  const normalized = Math.max(0, Math.min(100, sensitivity)) / 100;
  const luminanceThreshold = Math.round(110 + normalized * 135);
  const chromaThreshold = Math.round(18 + normalized * 82);
  const softStart = Math.max(0, luminanceThreshold - 70);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
    const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);

    if (luminance >= luminanceThreshold || chroma > chromaThreshold) {
      data[index + 3] = 0;
      continue;
    }

    const darkness = Math.max(
      0,
      Math.min(
        1,
        (luminanceThreshold - luminance) /
          Math.max(1, luminanceThreshold - softStart),
      ),
    );
    const smoothDarkness = darkness * darkness * (3 - 2 * darkness);

    data[index] = lineColor.r;
    data[index + 1] = lineColor.g;
    data[index + 2] = lineColor.b;
    data[index + 3] = Math.round(data[index + 3] * smoothDarkness);
  }

  workerScope.postMessage({ buffer: data.buffer }, [data.buffer]);
};
