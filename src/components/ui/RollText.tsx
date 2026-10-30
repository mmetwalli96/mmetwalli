import { cssVars } from '@/lib/hooks';

export function RollText({ text }: { text: string }) {
  let index = 0;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="roll" aria-hidden="true">
        {text.split(' ').map((word, w) => (
          <span className="roll-word" key={`${word}-${w}`}>
            {Array.from(word).map((char, c) => (
              <span key={c} className="roll-char" data-char={char} style={cssVars({ '--i': index++ })}>
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    </>
  );
}
