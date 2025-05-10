import { useState, useEffect } from "react";

const KEY = "f608407f";

export function useMovies(
  query // , callback
) {
  // We accept query as a parameter here
  // we also accept a callback function here that the user of this custom hook can pass in if they want and then we can call that at the very beginning. So we do call it in the beginning in our effect below. Also we only want to call it if it actually exists, so we do optional chaining
  // We can think of this arguments a bit lke the public API of this custom hook
  // we also extract the states necessary for making the fetching movies work, from the App component into this custom hook:
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      // callback?.(); // here we are calling the callback function if it actually exists. Reason for commenting this is at bottom beside dependency array

      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setIsLoading(true);

          setError("");

          const res = await fetch(
            `http://www.omdbapi.com/?apiKey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies!");

          const data = await res.json();
          // console.log(data);

          if (data.Response === "False") throw new Error("Movie not found !");

          setMovies(data.Search);
          // console.log(movies);

          setError("");
        } catch (err) {
          // console.error(err.message);

          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      if (!query.length) {
        setMovies([]);
        setError("");
        return;
      }

      //   handleCloseMovie();
      fetchMovies(); // here we just call the function

      // Cleanup function:
      return function () {
        controller.abort();
      };
    },
    [
      query, //callback
    ] // Now React actually tells us to add the callback in the dependency array too but doing so will give infinite reload of errors and so for now we remove this aboility from our app, this was just for showing we can actually do this
  );

  return { movies, isLoading, error };
}
