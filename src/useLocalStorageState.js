import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    // Here we gave generic names like value and setValue because the idea of this hook is to easily reuse it in other projects
    // We also want the user to be able to choose what key he wants to use for which we passed the key argument
    const storedValue = localStorage.getItem(key);

    // Now in the very beginning if we had no local state at all yet, then we see some errors in the console because now our watch list is basically null and then our app somewhere, is trying to call the map() method on that. So we need to fix this and we do that by using the initialState argument that we accepted in the code in this useLocalStorageState.js file

    return storedValue ? JSON.parse(storedValue) : initialState; // so we need to check if storedValue variable above actually exists. So in case of empty watch list, it will be null. So if storedValue exists, we return JSON.parse(storedValue), otherwise we return the initialState which in this case is an empty array
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value)); // now we don't have to create a new array like [...watched, movie] that we created while doing same this in handleAddWatched() function because this effect will only run after the movies have already been updated.
    },
    [value, key] //  Here we also pass both value and key because our effect depends on them. We want this effect to run each time the watched movies are updated so we passed value state in dependency array. Also, now we can see that on deleting a movie from watched list on screen(so deleting a movie from watched array), it also gets deleted from local storage. This is because thanks to our effect here, we have effectively synchronized the value state with our local storage. So when the value state(watched array) changes, our local storage changes as well. So this is a great advantage of using useEffect() hook instead of setting local storage in the event handler because then we would also have to manually set local storage in the handleDeleteWatched() function as we delete a movie. Now if we did so, there to inside setItem(), in place of actual data, instead of writing watched directly(so using watched state directly), we would have to write watched.filter((movie) => movie.imdbID !== id)(This is how we set in the setWatched in the handleDeleteWatched() function)
  );

  return [value, setValue];
}
