/** Lets keyboard users jump past the navigation. Works with any router mode. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link"
      onClick={(event) => {
        event.preventDefault();
        const main = document.getElementById('main');
        main?.focus();
        main?.scrollIntoView();
      }}
    >
      Skip to content
    </a>
  );
}
