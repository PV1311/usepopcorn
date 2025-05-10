import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f608407f";

export default function App() {
  const [query, setQuery] = useState("");
  // Below 3 states(movies, isLoading and error) are necessary for the below commented effect that fetch movies that we extracted from this App component into the useMovies custom hook, so we extract these 3 states too from here and movie them to useMovies.js
  // const [movies, setMovies] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { movies, isLoading, error } = useMovies(
    query // , handleCloseMovie
  ); // We import this custome hook in this file at top and pass the query. Also, from our custom hook, we need to return everythig that we need in our App. So basically all the variables that somewhere in our JSX are necessary. And that's basically exactly the 3 pieces of state that we extracted from this App component and pasted in useMovies.js. So we return them from useMovies() and destructure them here. we also pass the handleCloseMovie() function as a callback function in the useMovies() custom hook because it is needed there. Also, we can actually use this handleCloseMovie here bacause the this function is defined below, it is actually hoisted because of that. Now React actually tells us to add the callback in the dependency array too but doing so will give an infinite reload of errors and so for now we remove this aboility from our app, this was just for showing we can actually do this and so we comment the handleCloseMovie from here

  const [watched, setWatched] = useLocalStorageState([], "watched"); // we pass in the initial state which was an empty array for the watched array

  // Now in the very beginning if we had no local state at all yet, then we see some errors in the console because now our watch list is basically null and then our app somewhere, is trying to call the map() method on that. So we need to fix this and we do that by using the initialState argument that we accepted in the code in useLocalStorageState.js file

  // Now, we also create a useLocalStorageState custom hook which will basically behave just like the useMovies custom hook but where the state actually gets store in local storage. So with that hook, we will be able to replace the just below code of watched state which gets initial value from local storage and also the effect which is responsible for storing the state in local storage. We call our hook in the just above line of code:

  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useState(function () {
  //   const storedValue = localStorage.getItem("watched");
  //   return JSON.parse(storedValue);
  // }); // Now, we added the watched list to local storage using and effect and to read the data back, we could have used another effect. However, this is a better way, in the top level of this App component, we comment out the old watched state definition and keep it just for reference and create a new watched state and inside the useState() on RHS, pass a callback function instead of an empty array which will create a new variable(let's say const storedValue) and then we can just read from the local storage with the getItem() method and in this method we pass the key('watched') that we used to store data in the local storage. And then we just need to return this value, so return JSON.parse(storedValue). We do JSON.parse() because the data is stored as a string by doing JSON.stringify(), so when we get the data back, we need to convert is back doing JSON.parse(). So React will then call that callback function on the initital render and we'll use whatever value is returned from that function as the initial value of the state. And that callback function actually needs to be a pure function and it cannot receive any arguments(so passing arguments is not going to work). Also, just like the values we pass in useState(). React will only consider this callback function on the initial render. So that function is only executed once on the initial render and simply ignored on subsequent re-renders.

  // So whenever the initial value of a useState() hook depends on some sort of computation, we should always pass in a function just like we did just above in the useState() hook for the watched state, so a function thatReact can use on initial render. We should not call a function inside useState() like useState(localstorage.getItem('watched)). We should not do this because even React would ignore the value of localstorage.getItem('watched) inside useState(), it would still call this function on every render which is not good.

  // We will also create another custom hook called useKey which will abstract the functionality of attaching and removing an event handler for a key press. So in the MovieDetails component we have a funcitionality that if we open a movie and then hit the Esc key on our keyboard, then it will close the movie. We implemented that using a useEffect() hook and since it is using a React hook, we can abstract it into its own custom hook(Go to MovieDetails component for more theory).

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);

    // local storage is just a very simple key value pair storage that is available in the browser and where we can store some data for each domain:
    // adding the watch list in local storage:
    // localStorage.setItem("watched", JSON.stringify([...watched, movie])); // we simply call localstorage which is simply a function available in all browsers. Then we set item using setItem(). Inside setItem(), we pass in the name of the key(so basically the name of the data that we want to store) and the actual data(now for actual data we cannot actually just use watched array by simply writing watched because it has just been updated in the just above line inside setWatched() and that updating happens in an asynchronous way so right here in setItem(), it would be stale state. So we do the same thing as we did in setWatched() just above i.e. [...watched, movie]). Now finally we need to convert this actual data to string because in local storage we can only store key value pairs where the vale is a string. So we use the built in JSON.stringify(). Now, once we add the movies and reload the page we don't see the added movies on the page because we also have to read the added movies from local storage but we can see the added movies in local storage in Application tab in chrome dev tools

    // Now we could also add this watch list to local storage in an effect instead of here in the event handler function, and we will actually do it in an effect instead of here because later in this section(Section 13), we will want to make this storing data into local storage, reusable.
  }

  function handleDeleteWatch(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // Now we are going to use local storage for our watched list so that on page reload, our watched list persisits. We are going to do this in 2 parts - first, each time the watched list state(watched state which is an array) is updated, we will update the local storage and then each time that the application loads, so when the app component first mounts, we will read that data from local storage and store it into the watched state. So we start with the first part which is storing watched movies in the local storage and we can do that in 2 different ways, or 2 different places. So the first option is to store that data into local storage each time that a new movie is actually added in the watched list, so right in the handleAddWatched() event handler function above that is responsible for adding new movies to the watch list. So each time that happens, we can then store the new watch list into the local storage. The 2nd option is to simply do it in an effect and we will actually do it in an effect instead of here because later in this section(Section 13), we will want to make this storing data into local storage, reusable. (for learning purpose, we did it in the above handleAddWatched() function too).

  // below is the effect for local storage. We commnet is here and paste it in useLocalStorageState custom hook:
  // useEffect(
  //   function () {
  //     localStorage.setItem("watched", JSON.stringify(watched)); // now we don't have to create a new array like [...watched, movie] that we created while doing same this in handleAddWatched() function because this effect will only run after the movies have already been updated.
  //   },
  //   [watched] // we want this effect to run each time the eatched movies are updated so we passed watched state in dependency array. Also, now we can see that on deleting a movie from watched list on screen(so deleting a movie from watched array), it also gets deleted from local storage. This is because thanks to our effect here, we have effectively synchronized the watched state with our local storage. So when the watched state changes, our local storage changes as well. So this is a great advantage of using useEffect() hook instead of setting local storage in the event handler because then we would also have to manually set local storage in the handleDeleteWatched() function as we delete a movie. Now if we did so, there to inside setItem(), in place of actual data, instead of writing watched directly(so using watched state directly), we would have to write watched.filter((movie) => movie.imdbID !== id)(This is how we set in the setWatched in the handleDeleteWatched() function)
  // ); // Now, with this effect, watched movies are added to local storage and now we need to take care of 2nd part which is to read this data back into the application as soon as the App component mounts(so the component that owns this watched state). Now we might think of using another effct in order to get data from the local storage on the initial render and then store that data in the watched state. However, there is a better way, in the top level of this App component, we comment out the old watched state definition and keep it just for reference and create a new watched state and inside the useState() on RHS, pass a callback function instead of an empty array which will create a new variable(let's say const storedValue) and then we can just read from the local storage with the getItem() method and in this method we pass the key('watched') that we used to store data in the local storage. And then we just need to return this value, so return JSON.parse(storedValue). We do JSON.parse() because the data is stored as a string by doing JSON.stringify(), so when we get the data back, we need to convert is back doing JSON.parse(). So React will then call that callback function on the initital render and we'll use whatever value is returned from that function as the initial value of the state. And that callback function actually needs to be a pure function and it cannot receive any arguments(so passing arguments is not going to work). Also, just like the values we pass in useState(). React will only consider this callback function on the initial render. So that function is only executed once on the initial render and simply ignored on subsequent re-renders.

  // We will take the effect hook below which fetched our movie data and we will extract it into a hook called useMovies: (we created a separate file for this called useMovies.js. We also extract the states necessary for making the below effect work for fetching movies, from this App component into the useMovies custom hook):
  // useEffect(
  //   function () {
  //     const controller = new AbortController();

  //     async function fetchMovies() {
  //       try {
  //         setIsLoading(true);

  //         setError("");

  //         const res = await fetch(
  //           `http://www.omdbapi.com/?apiKey=${KEY}&s=${query}`,
  //           { signal: controller.signal }
  //         );

  //         if (!res.ok)
  //           throw new Error("Something went wrong with fetching movies!");

  //         const data = await res.json();
  //         // console.log(data);

  //         if (data.Response === "False") throw new Error("Movie not found !");

  //         setMovies(data.Search);
  //         // console.log(movies);

  //         setError("");
  //       } catch (err) {
  //         // console.error(err.message);

  //         if (err.name !== "AbortError") {
  //           console.log(err.message);
  //           setError(err.message);
  //         }
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }

  //     if (!query.length) {
  //       setMovies([]);
  //       setError("");
  //       return;
  //     }

  //     handleCloseMovie();
  //     fetchMovies(); // here we just call the function

  //     // Cleanup function:
  //     return function () {
  //       controller.abort();
  //     };
  //   },
  //   [query]
  // );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        {/* <Box element={<MovieList movies={movies} />} />
        <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
        {/* Above is prop drilling solution using explicity prop (element in this case. It can be anything. So we pass element as prop instead of children in the Box
            component and conditionally render that element prop). In the 2nd <Box /> component above, we are passing a brand new piece of JSX, so here now we actually
            need a fragment */}

        {/* Below is prop drilling solution using children prop */}

        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatch}
              watched={watched}
            /> // based on selectedId, we display the movie details on the right box of
          ) : (
            //              screen
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatch}
              />
            </> // if no selectedId is false, i.e. there os no selected movie, we display this React Fragment
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  // const [query, setQuery] = useState("");

  // Lec 165: HOW NOT TO SELECT DOM ELEMENT IN REACT:
  // Now just for experiment, lets automaticall give the input element in the NavBar(So the input element here in this Search component) focus each time that this Search component mounts(So basically each time the application mounts, we will automatically focus on this input field). In order to do that we need to select this input element. For this we can use a useEffect and then manually select this DOM element(this input element returned in the JSX here in this Search component):
  // We do this here because this input element is here in this Search component:
  // useEffect(function () {
  //   const el = document.querySelector(".search");
  //   console.log(el);
  //   el.focus();
  // }, []); // Here we manually select a DOM element and here the code works just fine. But React is all about being declerative. So manually selecting a DOM element like this is not the way of doing things in React(so it is not in line with the rest of our code). So in React we really don't want to manually add event listeners like this and also having to add classes or IDs just for the purpose of selecting is not really nice and again, not really the React way of doing things. So here we already had the className in the input element ofcourse, but if we didn't, then we would have to now add the className or ID here to then use it in the effect to select the element. Also if we would have some dependencey here in the dependency array, let's say query state, then this effect runs each time the query changes and then that would mean that we would select the element here over andd over again which is also not ideal. So to solve all these problems and to make the action of selecting an element more declerative, such as everything else in React, we need the concept of refs.

  // Lec 166: INTRODUCING ANOTHER HOOK: useRef():
  // NOTE :- Refs are mutable objects with .current property with which we can write into and read from refs
  // NOTE :- Refs use cases - 1. Creating variables that stay same between renders(Ex: previous state, setTimeout id, etc.), 2. Selecting and Storing DOM elements
  // NOTE :- Refs are for data that is NOT rendered in the visual output of the component - so they usually only appear in event handlers or effects, but not in the JSX.
  // NOTE :- If you need data that participates in the visula output of the component, that's actually a good sign that you actually need a state and not a ref
  // NOTE :- Just like state, you are not allowed to write or read .current property in render logic as that would create undesirable side effect. Istead, we usually perform these mutatuons inside a useEffect() hook.
  // NOTE :- We use state when we want to store data that should re-render the component and we use Refs for data that should only be remembered by component over time but never re-render it.

  // Lec 167: Refs TO SELECT DOM ELEMENTS:
  // We now do the focusing part where as the application loads, we automatically focus on the input element in this Search component using REfs intead of manually selecting DOM elements as we did earlier:
  // Using a Ref with a DOM element happens in 3 steps: first we create a Ref using useRef() hook and inside it we pass the initial value that we want to be in the .current property. In this case when we work with DOM elements, it is usually just null. This will simply return a Ref that we can give any name to and we store it in inputEl variable below. As a second step, we go to the element that we want to select and in it define the ref prop and in it pass in the ref that we just created. Now in the third step, in order to use this Ref, we can use again, the useEffect() hook. So we need to use an effect in order to use a ref that contains a DOM element(like the inputEl below) because the ref only gets added to the DOM element(the input element i.e. the Search bar on screen, so the input element in the returned JSX here in this Search component) after the DOM has already loaded and so therefore we can only access it in effect which also runs after the DOM has been loaded.
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;

    inputEl.current.focus();
    setQuery("");
  }); // For the callback function now this is a little bit tricky. We can see in the just below effect that we had quite a few things in the callback function and the if() part is already in the custom hook where it compares the pressed key with the key that we're interested in and in useKey.js, the action call inside if() over there is corresponding to the code inside if() block in the just below effect. So we define a callback function as here but then we would miss the functionality of the first few allback function in the below effect where we check the active element. So we also need to include it. So it would be like cutting that active element code and pasting it inside the if() block in the callback function of the effect below which would not alter the functionality of that code at all and so we do the same thing here while passing a callback to useKey().

  // useEffect(
  //   function () {
  //     function callback(e) {
  //       if (document.activeElement === inputEl.current) return;

  //       if (e.code === "Enter") {
  //         inputEl.current.focus();
  //         setQuery("");
  //       }
  //     }

  //     document.addEventListener("keydown", callback);

  //     // Cleanup function:
  //     return () => document.addEventListener("keydown", callback);
  //   },
  //   [setQuery]
  // ); // Now we also want to implement a feature in which when we press Enter key from anywhere in the application, automatically, the imput field gets focused. Now let's say I have searched for a movie and then selected it and then at a certain point, again, I hit the Enter key, doing so will again select the input field(focus it) and it also removed all the search query text. For this, the first thing we need to do is to listen for that key press event. (We actually listende for a key press event in the MovieDetails component and there in that case we actually did need to manually select the document and then add an event listener there so there we cannot use a Ref). Now when we are writing some query, then pressing Enter should not do this functionality. So basically we don't want this to happen when the element is already focused(so when it is already active). We can easily check which element is currently active using document.activeElement property

  // Now Refs can also simply give us variables that are persisted across renders without triggering a re-render. So now when we search for some movie and select it, lets say behind the scenes of this application, we want to count how many times a user selects a different rating. So for example, lets say we first rate it 3, then 7 and then 9. So this means that it took us a long time to decide between the right rating of that movie and so lets say that in our application, we somehow wanted to register that. Now we actually say behind the scenes because we actually don't want to show this data on the screen(so basically we don't want like a counter anywhere in our app which tells us how many times the user har clicked on the stars for rating). So this time what we need is a variable that is persisted between renders but that does not cause a re-render when it is updated. So Ref is a perfect use case for this. So now we go to MovieDetails component and create that Ref

  // We will create a custom hook called useKey which will abstract the functionality of attaching and removing an event handler for a key press. So in this Search component we have a funcitionality that we focus on the search bar(from anywhere in the app, except if we are already in the input element(the search bar), on hitting Enter key, focus will automatically go on the search bar and the search query text will be deleted). So its a good idea to abstract this functionality into a custom hook and then reuse that here (we use the useKey in the top level of this Search component just after the useRef()):

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  // instead of using children prop to solve prop drilling, we can also use an explicit pro (like element we used here instead of children)

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  // Now Refs can also simply give us variables that are persisted across renders without triggering a re-render. So now when we search for some movie and select it, lets say behind the scenes of this application, we want to count how many times a user selects a different rating. So for example, lets say we first rate it 3, then 7 and then 9. So this means that it took us a long time to decide between the right rating of that movie and so lets say that in our application, we somehow wanted to register that. Now we actually say behind the scenes because we actually don't want to show this data on the screen(so basically we don't want like a counter anywhere in our app which tells us how many times the user har clicked on the stars for rating). So this time what we need is a variable that is persisted between renders but that does not cause a re-render when it is updated. So Ref is a perfect use case for this. So now we create that Ref here in this MovieDetails component:
  const countRef = useRef(0); // Now the idea is that each time the user gives a rating by clicking on one of the stars, this countRef Ref should get updated so that then when the user actually adds the movie to the list by clicking on the + Add to list button, we can then add that to the newWatchedMovie object that we created below in the handleAdd() function so that then we can then finally store that value somewhere. Normal click would not work as it would reset to 0 on every re-render and then even though in effect we add 1 to it and will pass it in dependency array too, it's final value will only be 1

  // We now update the Ref using useEffect because again, we are not allowed to mutate the Ref in render logic:
  useEffect(
    function () {
      if (userRating) countRef.current = countRef.current + 1; // this updating here should only happen when there already is a rating because the effect will also run on mount and so then it will already add 1 here even without the user having rated. So for that we added if (userRating) which in the beginning will be not there because it'll still be the empty string which we passed in useState() in RHS while defining userRating state. Here we imperatively updated the countRef variable. So with Ref we don't have a setter function but we simply mutate the .current property which is in the Ref
    },
    [userRating] // We want to update the Ref each time the user rates the movie again(so that's each time the userRating state updates). So we pass the userRating state in the dependency array
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  // // Lec 16. THE RULES OF HOOKS IN PRACTICE:

  // // So lets do as just below(returning a hook conditionally) and then call hook after an early return below it. VSCode will immediately complain and tell us that just below we are not allowed to use useState conditionally. But we can disable this rule by writing eslint-disable inside /* */:
  // /* disable eslint here(write eslint-disable) */
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true); // Now, searching interstellar and selecting interstellar wars (2016), we now have no problem as we can see in the component tree that MovieDetails components still has the 6 hooks(3 states from top level and 3 effects). That's because its rating is just 1.7. But now when we click interstellar (2014), our application immediately stops working. On console we can see the error that React has detected a change in the order of Hooks called by MovieDetails. It also tells some useful information. So in the previous render, there were 3 useState hooks and then the number 4 was an effect and that previous render actually happened after we clicked on the movie but while the movie had not been fetched yet. So at that point the imdbRating here was still undefined and so then the useState hook here was not called. But as soon as the data arrived, the imdbRating was indeed greater than 8 and the then React called the useState here and so then on the next render, the 4th hook was no longer the useEffect but this useState from here. So now clearly we see that our linked list of hooks is different

  // // Now one more thing that can happen is an early return:
  // if (imdbRating > 8) return <p>Greatest ever!</p>; // Doing this will now give an error saying Rendered fewer hooks than expected and that's because we now have the three states from the top level but now, the 3 effects that we had are no longer created because of this early return. So instead of the 6 hooks, we now only have 3 hooks. So this again creates a big problem.

  // // Lec 17. MORE DETAILS OF useState:
  // // NOTE: in the useState hooks, the initial state that we pass only really matters on the initial render
  // // So lets say we wanted something like if (imdbRating > 8) [isTop, setIsTop] = useState(true); to work here. So we wanted a piece of state called isTop which is true if the imdbRating is greater than 8. Now we cannot do if (imdbRating > 8) [isTop, setIsTop] = useState(true); as we already learned just above, but we might think that the just below line works:
  // // const [isTop, setIsTop] = useState(imdbRating > 8);
  // // console.log(isTop); // Now when we search for a movie(lets say interstellar) and select it, then we see that false is logged on console and it comes from this console.log() and false is logged even though the rating is actually greater than 8 and if we look at our list of hooks from the component tree, then we see that this state(which is the 4th state there) is false. This is because of the reason that whatever we pass into useState is the initial state and React will only look at this initial state on the initial render(so when the component first mounts). However, when the component first mounts here, the imdbRating will still be undefined and so the imdbRating > 8 that we passed inside useState here will be false and it will stay false forever because nowhere we update the state, and on second render, when we finally get tha movie data, this imdbRating > 8 that we passed in useState will not be executed again. So therefore, again, it will stay false forever. Now one way of fixing this would be useEffect as in the just below line:
  // // useEffect(
  // //   function () {
  // //     setIsTop(imdbRating > 8); // In this case, now the above isTop is true when we select interstellar movie. We can even see the 4th state in the component tree, which will now be true.
  // //   },
  // //   [imdbRating] // we want to run this effect each time the imdbRating is changed so we passed it in dependency array
  // // );
  // // Now, ofcourse in this situation, we shouldn't even use a piece of state in the first place. So if the just above functionality of the state is what we really wanted then what we should do is derived state. So we should just do as in the just below line:
  // const isTop2 = imdbRating > 8; // (in lecture just above code wass commented and variable here was isTop but I used isTop2 variable here)
  // console.log(isTop2); // we see that this simple code for isTop2 derived state works seamlessly (So when we select interstellar movie, true is logged from this consol.log()). This is because this imdbRating variable here is generated each time that the function here is executed, so after each render.(So this is the power of derived stae, So it gets updated as the component gets re-rendered.)

  // // Now below we show another example that updating state is synchronous:
  // // For that, lets say we create a new state just below for displaying the average of the rating that we gave and the rating that is coming from IMDB, right there instead of closing the movie immediately. So for that we also comment the onCloseMovie() function call at the end of the handleAdd() function below:
  // const [averageRating, setAverageRating] = useState(0); // we render it in the returned JSX between the <header></header> element and <section></section> element. This is just for learning purpose so whatever we are doing just now,we will comment it afterwards. So now, when we click on the + Add to list button, the handleAdd() function below is executed and then we actually set this averageRating state over there.(Some theory is written there too)

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // setAverageRating(Number(imdbRating)); // first we set it to the actual current IMDB rating which is a string so we convert it to number. Now we alert the averageRating just below:
    // // alert(averageRating); // Now, on clicking, + Add to list button on interstellar movie, instead of 8.6(it's IMDB rating), 0 is alerted. That's again, because the state is set asynchronously just above(or in other words, we do not get access to the updated state, right after doing that. So right after we call the state updating function). So only once React is done processing this event handler, it will then update our state and re-render our UI. Now in the just below line, we write logic for actually setting averageRating
    // // setAverageRating((averageRating + userRating) / 2); // after doing this, if we now, give 10 rating to interstellar movie and click on + Add to list button, then we see 5 rating set on the screen right below the movie poster. So our average is not correctly being calculated. So that 5 wee see on screen is really just 10/2. Reason for that is that here in this setAverageRating() function, averageRating is still at zero and so then (0 + 10)/2 is 5. But averageRating is still at 0 here even though we have updated it before is because its' asynchronous state setting which means that at this point here, inside this setAverageRating() function, averageRating has not been set yet, So it is still at 0 which is the initial value right inside useState() where we defined this state. Because of that we say that averageRating is stale at this point. but we can solve this by passing in a callback function. So we comment this line and fix in the just below line
    // setAverageRating((averageRating) => (averageRating + userRating) / 2); // Now we get the correct average.
  }

  useKey("Escape", onCloseMovie);

  // We will also create another custom hook called useKey which will abstract the functionality of attaching and removing an event handler for a key press. So in the MovieDetails component we have a funcitionality that if we open a movie and then hit the Esc key on our keyboard, then it will close the movie. We implemented that using the just below useEffect() hook and since it is using a React hook, we can abstract it into its own custom hook(called useKey) because actually we do something very similar to focus on the search bar(from anywhere in the app, except if we are already in the input element(the search bar), on hitting Enter key, focus will automatically go on the search bar and the search query text will be deleted). So that is basically using some similar functionality. So its a good idea to abstract this functionality into a custom hook and then reuse that in both the places(we use the useKey in the just above line and in the Search component):

  // useEffect(
  //   function () {
  //     function Callback(e) {
  //       if (e.code === "Escape") onCloseMovie();
  //       // console.log("CLOSING");
  //     }

  //     document.addEventListener("keydown", Callback);

  //     return function () {
  //       document.removeEventListener("keydown", Callback);
  //     };
  //   },
  //   [onCloseMovie]
  // );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apiKey=${KEY}&i=${selectedId}`
        );

        const data = await res.json();
        // console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      //we can change the title of the page in the browser just by setting document.title
      if (!title) return;
      document.title = `Movie | ${title}`;

      // Cleanup function(A cleanup function is simply a function that we return from an effect):
      return function () {
        document.title = "usePopcorn";
        // console.log(`Cleanup effect for movie ${title}`);
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDB rating
              </p>
            </div>
          </header>

          {/* <p>{averageRating}</p> */}

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />

                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      {/* here we passed another handler that will call the one we passed into this MovieDetails component(the onAddWatched prop that we passed) because
                          we need to do a lot of things in it */}
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating}
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
