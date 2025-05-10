import { useEffect } from "react";

export function useKey(Key, action) {
  // this one is the easiest custom hook. It doesn't need to return anything and all we need to know what should happen. So we need a callbakc function in place of onCloseMovie() function call below and we also need the user of this custom hook to tell us on which key press the effect below should actually be executed
  // the action argument is the callback function
  useEffect(
    function () {
      function Callback(e) {
        if (e.code.toLowerCase() === Key.toLowerCase()) {
          // Now, the user might pass the keys in different formats(Ex: EscApe, ESCape. etc.) so to correctly compare them, we use .toLowerCase() on both sides in the if()
          // onCloseMovie();
          action();
          // console.log("CLOSING");
        }
      }

      document.addEventListener("keydown", Callback);

      return function () {
        document.removeEventListener("keydown", Callback);
      };
    },
    [action, Key]
  );
}
