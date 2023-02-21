const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function getFrameFactory() {
  let i = 0;

  return () => {
    const frame = frames[(i = ++i % frames.length)];

    return frame;
  };
}

export function logSpinner(
  stream,
  interval = 100,
  frameFactory = getFrameFactory
) {
  const frame = frameFactory();

  let resetBeforeWrite = false;

  stream.write("\u001B[?25l");

  const timer = setInterval(() => {
    if (resetBeforeWrite) {
      stream.write("\r");
    }

    stream.write(frame());

    resetBeforeWrite = true;
  }, interval);

  return () => {
    stream.write("\r ");
    stream.write("\u001B[?25h");

    clearInterval(timer);
  };
}
