import type { PantagraphStore } from '@/features/pantagraph/store/usePantagraphStore';
import type { StudioCompositeMeta } from '../store/useMouzaMapStudioStore';

const MAX_COMPOSITE_DIMENSION = 8192;
const MAX_COMPOSITE_PIXELS = 24_000_000;

type Point = { x: number; y: number };

export type StudioComposite = {
  image: HTMLImageElement;
  meta: StudioCompositeMeta;
};

function getTransformedCorners(
  image: HTMLImageElement,
  position: Point,
  rotation: number,
  scaleX: number,
  scaleY: number,
  skewX: number,
  skewY: number,
): Point[] {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ].map(({ x, y }) => {
    const transformedX = scaleX * x + skewX * y;
    const transformedY = skewY * x + scaleY * y;

    return {
      x: transformedX * cos - transformedY * sin + position.x,
      y: transformedX * sin + transformedY * cos + position.y,
    };
  });
}

function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Aligned map তৈরি করা যায়নি'));
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Aligned map load করা যায়নি'));
      };
      image.src = objectUrl;
    }, 'image/png');
  });
}

export async function createStudioComposite(state: PantagraphStore): Promise<StudioComposite> {
  const { formerMap, currentMap } = state;
  if (!formerMap || !currentMap) {
    throw new Error('C.S এবং B.S—দুটি map-ই upload করুন');
  }

  const corners = [
    ...getTransformedCorners(
      currentMap,
      state.currentPosition,
      state.currentRotation,
      1,
      1,
      0,
      0,
    ),
    ...getTransformedCorners(
      formerMap,
      state.formerPosition,
      state.formerRotation,
      state.formerScaleX,
      state.formerScaleY,
      state.formerSkewX,
      state.formerSkewY,
    ),
  ];

  const minX = Math.min(...corners.map((point) => point.x));
  const minY = Math.min(...corners.map((point) => point.y));
  const maxX = Math.max(...corners.map((point) => point.x));
  const maxY = Math.max(...corners.map((point) => point.y));
  const contentWidth = Math.ceil(maxX - minX);
  const contentHeight = Math.ceil(maxY - minY);

  if (contentWidth <= 0 || contentHeight <= 0) {
    throw new Error('Aligned map-এর dimension সঠিক নয়');
  }

  const dimensionScale = MAX_COMPOSITE_DIMENSION / Math.max(contentWidth, contentHeight);
  const pixelScale = Math.sqrt(MAX_COMPOSITE_PIXELS / (contentWidth * contentHeight));
  const outputScale = Math.min(1, dimensionScale, pixelScale);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(contentWidth * outputScale));
  canvas.height = Math.max(1, Math.round(contentHeight * outputScale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas তৈরি করা যায়নি');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(outputScale, outputScale);

  const drawMap = (
    image: HTMLImageElement,
    position: Point,
    rotation: number,
    opacity: number,
    scaleX: number,
    scaleY: number,
    skewX: number,
    skewY: number,
  ) => {
    context.save();
    context.globalAlpha = opacity;
    context.translate(position.x - minX, position.y - minY);
    context.rotate((rotation * Math.PI) / 180);
    context.transform(scaleX, skewY, skewX, scaleY, 0, 0);
    context.drawImage(image, 0, 0);
    context.restore();
  };

  const drawFormer = () => drawMap(
    formerMap,
    state.formerPosition,
    state.formerRotation,
    state.formerOpacity,
    state.formerScaleX,
    state.formerScaleY,
    state.formerSkewX,
    state.formerSkewY,
  );
  const drawCurrent = () => drawMap(
    currentMap,
    state.currentPosition,
    state.currentRotation,
    state.currentOpacity,
    1,
    1,
    0,
    0,
  );

  if (state.activeMap === 'former') {
    drawCurrent();
    drawFormer();
  } else {
    drawFormer();
    drawCurrent();
  }

  const image = await canvasToImage(canvas);
  const meta: StudioCompositeMeta = {
    width: canvas.width,
    height: canvas.height,
    outputScale,
    bounds: { minX, minY, maxX, maxY },
  };

  canvas.width = 1;
  canvas.height = 1;
  return { image, meta };
}
