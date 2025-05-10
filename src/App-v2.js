import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f608407f";

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // now whenever movie data is still being loaded in the background, we want to instead display some loading
  //                              indicator. So in case movie data loading takes time, we see a flash where there is no content. So the movie data was loading but
  //                              hadn't arrived yet. So now in the mean time we want to display some loading indicator. So in order to do that we have this state which
  //                              tells UI that data is still being loaded and then as soon as the data has been loaded, we want to display that data and not that
  //                              indicator anymore. In our effect, right before the fetching actually starts, we setIsLoading to true.

  const [error, setError] = useState(""); // we want to display the new error message that we throw below in case an error happens while fetching data, onto the screen
  //                              instead of the Loading indicator. So this state is for that. It tells currently whether we have an error or not. Here it not a boolean
  //                              but truly the error message. Based on this error state, we will conditionally render the ErrorMessage component which receives a
  //                              messgae prop with some message that it will then display on the screen.

  const [selectedId, setSelectedId] = useState(null); // we need to select a movie and display some data related to it. Selecting happens on left box on screen and
  //                              displaying happens on right box on screen. So we create this state here in the parent component. Here we only store the id and not the
  //                              entire movie object itself because the movies that we get here from the search very limited(we only get data about the title, year and
  //                              the poster). On the right side we will want all kinds of details that are not included in the first search. So there would have to be
  //                              another API call which will load the movie again and then we will get all the details and this movie will be fetched based on the ID
  //                              that we get in the array we get when we search a movie(we can see this array by doing console.log(data.Search))

  // const tempQuery = "interstellar";

  /*
  // BELOW IS JUST AND EXPERIMENT WITH DEPENDENCY ARRAY OF EFFECT:
  // useEffect(function () {
  //   console.log("After initial render");
  // }, []);

  // useEffect(function () {
  //   console.log("After every render");
  // });

  // console.log("During render"); // we can see that on console, first During render is logged, then After initial render, then After every render. the reason is that
  //                              effects only run after the Browser paint while the render logic runs during render. So console.log("During render") is executed
  //                              initial render and then After every render simply because After initial render appears first in the code. After it if we type any
  //                              letter in the Search bar, we update the query state and hence the component is re-renered and hence console.log("During render") was
  //                              executed due to which we see During render first and then After every render because the effect that logs After every render has no
  //                              dependency array which means that effect is synchronized with everything and therefore it runs on every render. The effect that logs
  //                              After initial render is synchronized with no variables(which is the meaning of the empty array) and therefore that effect was not
  //                              executed as the component was re-rendered with the query state.

  // BELOW IS ANOTHER EXPERIMENT WITH DEPENDENCY ARRAY OF EFFECT:
  // useEffect(function () {
  //   console.log("After initial render");
  // }, []);

  // useEffect(function () {
  //   console.log("After every render");
  // });

  // useEffect(
  //   function () {
  //     console.log("D");
  //   },
  //   [query]
  // );

  // console.log("During render"); // now, once we type a letter in search bar, first During render is logged, then After every render and then D. Now we get D logged
  //                               because then effect logging it is synchronized with the query state variable. Therefore the query just changed and the effect
  //                               synchronized with state was executed and logged D.
*/

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id)); // if we click on the same movie on left box on screen as is open on right box, we want to close
    //                                movie on right box and if we select a movie different from the one open on right box then we want to open that movie on the right
    //                                box
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatch(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatch(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // We also need an effect for closing the MovieDetails component in the right box of screen whenever we press Esc button too. So this is clearly a side effect since
  // we will directly touch the DOM and so we need an effect. So we basically need to globally listen to that keypress event and the way in which we can react to a
  // keypress event in the entire app is simply by attaching an event listener to the entire document. So we will do it directly here in the App component(but actually
  // we do it in MovieDetails component and theory for it is written here below why it is so. We do it here just for explanation):

  // useEffect(function () {
  //   document.addEventListener("keydown", function (e) {
  //     if (e.code === "Escape") handleCloseMovie();
  //   });
  //
  //   // if we simply do this  document.addEventListener("keydown", function (e) {
  //   //                           if (e.code === "Escape") handleCloseMovie();
  //   //                           });
  //   //     then this event is fired everytime, even if the MovieDetails component is
  //   //     unmounted and is not even there. So we want to attach this event listener to
  //   //     the document whenever we actually have the MovieDetails component in our tree.
  //   //     So we cut the effect from here and place it in our MovieDetails component.
  // }, []);

  // At times of fetching data and dealing with asynchronous data, we need to assume that somethings can go wrong(like internet connection breaking while fetching data
  // or no movie found for the search query) and therefore we also need to account for those situations by handling those errors.
  useEffect(
    function () {
      const controller = new AbortController(); // first step for using the abort controller is to create one. Then, in order to connect abort controller with the fetch
      //                             function, we pass in a second argument where we define an object with the signal property and there we need to pass in
      //                             controller.signal. Now in our cleanup function, we can simply do controller.abort().

      async function fetchMovies() {
        try {
          setIsLoading(true); // this tells UI that loadind is happening and we can then render the indicator over there. Then after everything is finished, we set
          //                     isLoading state back to false as seen towards the end in the finally{} block in this function

          setError(""); // before we start fetching we also set the error to an empty string because if we do not do this and if we get an error at some point and we
          //               generate an error message on the screen(logic for catching and setting error done below), then the next time we try to fetch data and display
          //               on screen, fetching will be done correctly(if no error occurs) but displaying cannot be done and still error is displayed on screen because
          //               we we never reset the error.

          const res = await fetch(
            `http://www.omdbapi.com/?apiKey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies!"); // now in between fetching data, user's internet connection might break so app will always
          //                            keep showing the Loading indicator making user beleive that data will arrive at some point. so when it happens we want to
          //                            display an error message on screen. Now reacting to errors like this is not built into the fetch() function itself, we need to
          //                            do it manually. Now here on the response object that we receive from the fetch() exists one ok property. So basically if the
          //                            response is not ok, then we want to throw a new error. Now if we throw an error here, we need to wrap all our code into a try
          //                            catch block.

          const data = await res.json();
          // console.log(data);

          if (data.Response === "False") throw new Error("Movie not found !"); // if for a query, no movie is found, then the data that comes back from this API is
          //                             undefined. So we no longer have the Search property now(So we don't have data.Search). So what happens is that data.Search is
          //                             being set to undefined. So now if we log the received data on cosole, we see an object with Response and Error properties. So
          //                             we can use Response(which in this case is False) to check if the movie is not found and throw an Error. This is here and not
          //                             anywhere else because we check it after we have received the data from API.

          setMovies(data.Search);
          // console.log(movies); // here if we try to log the movies to the console, we get an empty array as a result. This happens becuase setting state is
          //                         asynchronous. So after setting state in the just above line using setMovies(), it doesn't mean that it happens immediately. So it
          //                         will happen after the function has been called. so right here in console.log(movies), we have stale state. So before, movies was
          //                         just an empty array which gets logged. After some time we get the correct output. Now if we do this console.log() again, we get
          //                         correct output. Now, the reson for getting two outputs is because of React's strict mode. So when strict mode is active in React 18,
          //                         our effects will run not only once, but twice(but only in development. So when our application is in production, this will no longer
          //                         be happening). This happens so React can identify if there are some problems in our effects.

          setError(""); // To make the AbortError thing in the catch() block below work, we also need to set the error to empty string after the movies have been set
          //               here.
        } catch (err) {
          // console.error(err.message); // err.message is the string that pass into throw new Error('') as above.

          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          } // in case of error, we set the error state to the error string that we passed above while throwing error. Now based on this error state, we will
          //   conditionally render the ErrorMessage component which receives a messgae prop with some message that it will then display on the screen. Also, each time
          //   a request gets cancelled, JS sees it as an error which is caught in the catch block above and then Error message is displayed on left box of screen. But
          //   it is not an error in our application. So in catch block, we set the error only if err.name !== "AbortError". So this works because in that case the err
          //   object that we get access to in catch block(err that is passed in catch()) will have the name propert set to AbortError, so we can use it to our
          //   advantage to skip that case. To make this work, we also need to set the error to empty string after the movies have been set
        } finally {
          setIsLoading(false); // This is here because is we the error is thrown above, then the code after it in the try{} block will not be executed. So it is in this
          //                      finally{} block which is always executed. Now in the returned JSX, we conditionally render the <Loader.> component if isLoading is
          //                      true, but there are 2 more conditional renders with it. (Look and understand. if not understood, Watch Lecture 146 - Adding a loading
          //                      state and Lecture 147 - Handling errors)
        }
      }

      if (!query.length) {
        setMovies([]); // here we set movies back to an empty array(so basically removing all the movies from the UI)
        setError(""); // here we reset the error back to nothing
        return;
      } // if we don't do this if block, then when have no search query, we see error Movie not found on screen(even on opening application) which is not really true
      //   (It is actually true because the API actually searched for a movie with an empty string but in a situation when we have no query we actually don't even want
      //   to search). Also, doing this if block, the fetchMovies function will not even be called(as called in the just below line).

      handleCloseMovie(); // Now whenever there is a new search(for example, we select interstellar movie from left box on screen and it opens in right box on screen
      //                     and then we search another movie in the search bar), in that case we want to close the movie on right box of screen(so unmount the
      //                     MovieDetails component). So we call this handleCloseMovies() function here for that before we fetch the movies.
      fetchMovies(); // here we just call the function

      // Cleanup function:
      return function () {
        controller.abort(); // So each time there is a key stroke in the in search bar on screen, the component gets re-rendered. And as we already know, between each
        //                     render this cleanup function will get called. So that means each time there is a key stroke, our controller will abort the current fetch
        //                     request. So that is what we want, we want to cancel current request each time a new one comes in. So that is exactly the point in time in
        //                     which our cleanup function gets called. Now there is still a problem, each time a request gets cancelled, JS sees it as an error which is
        //                     caught in the catch block above and then Error message is displayed on left box of screen. But it is not an error in our application. So
        //                     in catch block, we set the error only if err.name !== "AbortError"
      };
    },
    [query]
  ); // useEffects() doesn't return anything so we don't store the result into any variable but instead we pass in a function and this function is then called our effect
  //    and it contains the code that we want to run as a side effect(so basically that we want to register as a side effect to be executed at a certain point in time).
  //    We also need to pass in a second argumnent which is a dependency array. We'll learn about it as we proceed further. empty array as here means that the effect that
  //    we just specified here will only run on mount. Now we can see that there are no infinite loops or requests. So now effect is only running as the component mounts.
  //    Now, whenever we need a lot of code to handle a promise, it's a lot easier and nicer to just have an async function. However if we write async before the function
  //    inside useEffect() here and use await inside it, we get an ESLint warning which tells us that effect callbacks are synchronous to prevent race conditions. So
  //    basically the effect function that we placed into useEffect() cannot return a promise which is what an async function does. So instead of doing diretly like this,
  //    we create a new function and place the async function there as we did here

  // Now, as we load the application, so on the initial render, we are not fetching any data. We are only fetching data as a result if searching for movies in the search
  // bar. So basically only as a response to that event. So therefore, we can now transform the above useEffect into a regular event handler function because that is
  // actually the preferred way of handling events in React. Also, that effect is actually now more of an event handler than anything else. So we can do that if we want
  // but the main goal was to learn useEffect hooks. In many situations we still want to fetch on mount and so in those situations this is still a perfectly valid way of
  // doing that, atleast in small applications like this one.

  // // We know we should never update state in render logic. Basic idea is to fetch some movie data as soon as this App component here mounts for the very  first time.
  // fetch(`http://www.omdbapi.com/?apiKey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => console.log(data.Search)); // Now, this data fetching that we are doing here is actually introducing a side effect into the component's render
  //                                  logic. So it is clearly an interaction with an outside world which should never be allowed in render logic. Now, as we see here, if
  //                                  insetead of logging the fetched data on console, we set state here with the fetched data, in the Network tab we can see that it is
  //                                  running an infinite number of requests and it never really stops. So every second, our app is firing off multiple requests to this
  //                                  API. This happens because setting the state here in the render logic will then immediately cause the component to re-render itself
  //                                  again. However, as the component is re-rendered, the function here is executed again, which in turn will fetch again, which in turn
  //                                  will set the movies again as well and this whole thing starts over and over again. So this is the reason why it is really not
  //                                  allowed to set state in the render logic. Now, we do actually need to set the movies here but without all the problems. So for that
  //                                  we need the useEffect() hooks.

  // // we see another example just below where wo use setWatched:
  // // setWatched([]); // We did setWatched here immediately in the top level code to some empty array and then actually we do get a real error. We get the error of
  //                       too many re-renders. It's because of this state setting right here in setWatched(). So if we are really setting state here in the top without
  //                       being inside a .then() handler, then immediately React will complain that there are too many renders which means we again entered that
  //                       infinite loop where updating the state will cause a component to re-render, which will cause the state to be set, and so on to infinity.

  // so we can useEffect() hook for above. The idea of it is to give us a place where we can safely write side effects like the above one. But side effects registered
  // with useEffect() hook will only be excuted after certain renders(for example, only write after initial render which is exactly what we are looking for in this
  // situation).
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

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
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
  // const [movies, setMovies] = useState(tempMovieData); // we need this state to dynamically calculate search results found for displaying in NumResults component and
  //                                     the state lives here in this MovieList component so we lift this movies state up from here to the common parent component which
  //                                     is App component and from there pass the movies state as prop to the Main component and then to the ListBox component and then
  //                                     to this MovieList component and from the App component we also send the movies state down to Navbar component and then to
  //                                     NumResults component inside which we dynamically display the Number of Search results by doing movies.length through prop
  //                                     drilling. This prop drilling can be tedious if components are very deeply nested then we have to pass the prop through a lot of
  //                                     components. A solution of this problem of prop drilling is Component Composition. Component composition is combining different
  //                                     components using the children prop or explicitly defined props. Ex as just below:
  //
  //                                     function Modal({ children }){
  //                                       return (
  //                                         <div className="modal">
  //                                           {children}
  //                                         >/div>
  //                                       )
  //                                     }
  //
  //                                     function Error() {
  //                                       return <p>This went wrong!</p>
  //                                     }
  //
  //                                     Now with Component composition we can simply do:
  //                                     <Modal>
  //                                       <Error />
  //                                     </Modal>
  //
  //                                     We can use component composition:
  //                                     1. When we want to create highly reusable and flexible components (such as the modal window)
  //                                     2. To fix prop drilling problem (great for layouts)
  //
  //                                     Now we use component composition to fix component drilling problem where we pass movies prop into the NavBar component and then
  //                                     from there into the NumResults component. Here we only have one leve of prop drilling. If we could use NumResults component right
  //                                     in the App component instead of the NavBar component, then we wouldn't have to pass the movies prop into the NavBar which will
  //                                     fix that prop drilling problem. So we do this with component composition as above. So we pass children prop in the NavBar
  //                                     component function and inside it, write {children} in the returned <nav></nav> element after the <Logo/> component and in the
  //                                     App component, instead of just <Navbar/> we write it like an HTML element and inside it write <Search/> and <NumResults/> as:
  //
  //                                    <NavBar>
  //                                      <Search />
  //                                      <NumResults movies={movies} />
  //                                    </NavBar>
  //
  //                                    Similarly we do for <Main/> component and for any further component if needed
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
  // whenever this MovieDetails component mounts, we want to fetch the movie corresponding to the selected ID. We want to do that each time the component mounts, so that
  // means we will want to use a useEffect() hook
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false); // when this MovieDetails component is open on the right box of screen for a movie selected from MovieList component
  //                                   on left box of screen, and then another movie is selected from the MovieList component, we see that there is a delay between the
  //                                   click and something changing in the MovieDetails component on the right box of screen. That's bacuase in the background the movie
  //                                   needs to be fetched. So just like before we want a loading indicator and this isLoading state is for that
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId); // we need to check if the watched array of objects that we received as prop includes the
  //                                  array that is currently selected. For that, we first transformed the watched array simply into an array of Ids using map() function
  //                                  on that we chain includes() to check if the array contains the currently selected ID. Now, based on this, we display the entire
  //                                  content of the <div> element with className="rating" in the returned JSX of this MovieDetails component. If !isWatched then we
  //                                  return the content as it is(i.e. as it should be returned) otherwise we return a paragraph with the current rating that we provided.
  //                                  We derive that rating from the watched array just below in the watchedUserrating variable which again is a derived state.

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating; // We just find the movie from the watched array where the imdbID is equal to selectedID and then if that exists, we get userRating from that. We used
  //                optional chaining because if we haven't watched any movie yet so there will be no movie in the watched array and then the find() method will return
  //                nothing

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
  } = movie; // here we destructure the needed data out of the received movie data

  function handleAdd() {
    const newWatchedMovie = {
      // this newWatchedMovie is the new watched movie that we will add in the WatchedMoviesList component(originally when the app is loaded, on the right box of screen
      // we have WatchedSummary component and below it we have this WatchedMoviesList component. On selecting a movie from the MovieList component on the left box of
      // screen, the WatchedSummary component and thisWatchedMoviesList components are replaced by the MovieDetails component. Now when the movie opened in the
      // MovieDetails component is added, then the movie is added and displayed in the WatchedMoviesList component which can be seen by closing the MovieDetails component
      // which will replace the MovieDetails component by the WatchedSummary component and the WatchedMoviesList component). We are just calling it newWatchedMovie here.
      // Now this object will also need an imdbID and here we can simply use the one that is currently selected. So the currently selected Id is the imdbID of that movie
      // that we are going to add
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating), // here we need to convert the imdb rating to a number so that we can do the statistics for displaying in the WatchedSummary
      //                                 component
      runtime: Number(runtime.split(" ").at(0)), // originally the runtime string had min attched too with a space in between(for example, 148 min). So we need only the
      //                           number part of the string which we get by doing runtime.split(' ').at(0). Now the result of this is still a string and we need to
      //                           convert this to number so we wrapped everything in Nmber()
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie(); // as soon as we add a movie we also want to close the opened movie(so close the MovieDetails component for the opened movie)

    // Now, we also want a rating to add in the watched movie. So we get this rating from the StarRating component and now we need the state rating from StarRating
    // component outside of the StarRating component and inside our MovieDetails component. So we can get that State outside of StarRating component by adding in a
    // function. So we define the onSetRating prop and into it we can pass a state setter function. So we create a state userRating here in the top level of MovieDetails
    // component for that purpose and the rating from StarRating component will be stored in useRating here. Also we only want the movie to be added if the user gave a
    // rating. So only if the user give a rating, we display the + Add to list button(so we conditionally render that button if userRating > 0)

    // We need to do one more thing, if we have already added a movie in the list, then we should not be able to add it again, So if we again select a movie from the
    // MovieList component in the left box of screen that is already added in the watched list(so in the WatchedMoviesList component), then we should not be able to rate
    // it and add it again. We should then only display the rating that we already gave(for example You rated this movie 7⭐). For this we need to pass the watched array
    // as prop in the MovieDetails component from the App component and receive that prop here in this MovieDetails component for checking. we do the checking by storing
    // a boolean result in the isWatched variable in the top level of this MovieDetails component(which is a derived state). Now, based on this, we display the entire
    // content of the <div> element with className="rating" in the returned JSX of this MovieDetails component. If !isWatched then we return the content as it is(i.e. as
    // it should be returned) otherwise we return a paragraph with the current rating that we provided. We derive that rating from the watched array just below in the
    // watchedUserrating variable which again is a derived state.

    // We also need to be able to delete the movies added to Watched list. So we make another handler function called handleDeleteWatched() in the App component and pass
    // it as a prop in the WatchedMoviesList component in the returned JSX of the App component because the watched movies are in that component so we pass the handler
    // function in the WatchedMoviesList component so that we can then pass it into each of the movies there
  }

  // We also need an effect for closing the MovieDetails component in the right box of screen whenever we press Esc button too. So this is clearly a side effect since we
  // will directly touch the DOM and so we need an effect. So we basically need to globally listen to that keypress event and the way in which we can react to a keypress
  // event in the entire app is simply by attaching an event listener to the entire document. So we will do it directly here in this MovieDetails component instead of the
  // App component because we want to attach the event listener to the document only when this MovieDetails component is in the tree:
  useEffect(
    function () {
      function Callback(e) {
        if (e.code === "Escape") onCloseMovie(); // function handleCloseMovie() was passed here through onCloseMovie prop so we use that here
        // console.log("CLOSING");
      }

      document.addEventListener("keydown", Callback);

      return function () {
        document.removeEventListener("keydown", Callback); // As soons as the Moviedetails component unmounts(closes) on Esc key press, the event listener is removed too,
        //                                 Now the function that we pass in here in removeEventListener must be exactly the same as we pass in addEventListener, so we
        //                                 define the Callback function spearately and pass it in.
      };
    },
    [onCloseMovie] // without anything in dependencey array, we see ESLint complaining and the reason for that is that we must actually include this onCloseMovie()
    //                function in the dependency array. So when React tells us that we need to include something here in the dependency array, we actually must do that
    //                otherwise there might be some consequences that we do not want.
  ); // Now just doing as here, we see on the console that when the MovieDetails component is not mounted, we do no see the CLOSING log but when the MovieDetails
  //    component is open(so it is mounted), then on pressing the Esc key again, the MovieDetails component unmounts(or closes) and we see the CLOSING log. Now when
  //    again we open a movie and close it(i.e. select a movie from left box which open it on the right box and we press the Esc key), we get even more of the logs on
  //    console. So it seems that the logs are basically accumulating. So the reson for that is that each time a new MovieDetails component mounts, a new event listener
  //    is added to the document, so basically always an additional one to the ones that we already have. We don’t want this so we also need to clean our event listeners.

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apiKey=${KEY}&i=${selectedId}`
        ); // we want to search by id so the parameter here is now i and we do &i=${queary}(we know this from API documentation)

        const data = await res.json();
        // console.log(data); // by doing this we can see that on slecting a movie on the left box, we get its details logged on console. Now we need to get some of this
        //                       data into our visible UI in the right box. For that we created the movie state at the top level of this MovieDetails component. The
        //                       default value inside useState() wwill be an empty object because an object is what we got back here from this API call.
        setMovie(data); // now we should be ready to use the data in our JSX
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  // Now when we click on another movie on left box, our component on right does not close(So our MovieDetails component on the right box is not updating). Here we told
  // our effect above to load the movie data whenever the component first mounts. However, when we click on any other movies on left box(from MovieList component), this
  // MovieDetails component is actually not mount again. So the initial render will not happen again because the component is already mounted. This is becuse the
  // MovieDetails component is rendered in exactly the same place in the component tree. So when we click on another movie on the MovieList component on left box on
  // screen, simply another prop will be passed here in the MovieDetails component but the component itself will not be destroyed. It will stay in the component tree and
  // so the only thing that will change as we click on one of the other movies from MovieList component on left box on screen, is the ID prop that is being passed in(so
  // the selectedId prop). Therefore, this effect above will not run again because, again, it is only running when the component mounts which only happens once. Now, if
  // we close this MovieDetails component on the right box of screen first and then select a movie from the MovieList component on the left box of screen, then it is
  // going to work. We can solve this by passing the seletedId prop in the dependency array which is the prop that changes. So now as the selectedId changes, the effect
  // will be executed again.

  // The just below effect is for changing page title:
  // So whenever we select a movie from the Movielist component on the left box of the screen, it will cause the Movieetails component to mount and so its exactly in that
  // situation where we want to change the browser title. So this MovieDetails component is where we want this effect:
  useEffect(
    function () {
      //we can change the title of the page in the browser just by setting document.title
      if (!title) return;
      document.title = `Movie | ${title}`;

      // Cleanup function(A cleanup function is simply a function that we return from an effect):
      return function () {
        document.title = "usePopcorn";
        // console.log(`Cleanup effect for movie ${title}`); // when the MovieDetails component on the right box of screen is closed then this cleanup function runs and
        //                                   the page title is set back to usePopcorn and this console.log also prints the title of the movie that was opened(for example
        //                                   if Inception movie was openend in MovieDetails component on right box of the screen then this console.log() prints Cleanup
        //                                   effect for movie Inception. But cleanup function executes when component unmounts, So we might think how did the function
        //                                   remeber the title in this console.log(). This is because a JS concept called Closure. So a closure in JS means that a
        //                                   function will always remember all the variables that were present at time and the place that the function was created. So in
        //                                   case of our cleanup function here, it was created by the time this effect first was created here and so by that time, the
        //                                   title was actually defined as Inception(The movie that we were seeing before on the MovieDetail component on the right box of
        //                                   screen). Therefore we say that this cleanup function closed over title variable and will therefore remember it in the
        //                                   fututre. So in this case, even after the component has already unmounted.
      };

      // we also need to clean our data fetching in the above effect. Because for every key stroke we are firing an HTTP requests which run simultaneously and it has 3
      // prolems -1. Having so many requests at the same time will slow each of them down. 2. It means we will end up downloading way too much data because we are not
      // even interested in the data for all the other queries but only for the data for the correct query which is in the last but still data for other queries were
      // downloaded. So we need to cleanup our fetch requests so that as soon as a new request fires off, the previous one stops. 3. Now if instead of the last request,
      // some other request takes the longest time to arrive, then results from that request would be stored in our state and that would be rendered on UI. We don't want
      // this but exactly the last request of all to be the one that matters. So we are not interested in other requests but if one of them takes longer than the others
      // then that one will actually become the one that we see in our UI. This is a pretty common problem and called a race condition. We fix this in our code by using
      // a native browser API(which is the abort controller) and we will then use it in our cleanup function in the effect where we fetch our movies data(so in the
      // effect in the App component). In order to use abort controller, first step for using the abort controller is to create one. Then, in order to connect abort
      // controller with the fetch function, we pass in a second argument where we define an object with the signal property and there we need to pass in
      // controller.signal. Now in our cleanup function, we can simply do controller.abort().
    },
    [title]
  ); // if we don't pass title in dependency array, then we get undefined as value in place of title. This is because initially the movie state is set to empty and only
  //    after the movie actually arrives, from the API, the component will re-render. So intially title is undefined, and since this effect will run only once in case of
  //    empty dependency array(when the component mounts), title will remain undefined forever. So when the component re-renders with the correct movie object and the
  //    correct title, our effect will not react to that. So to fix this we pass the title variable in the dependency array. Now after fixing this, without the if clause
  //    in this effect function, we first see undefined for a very short time and when the correct title arrives it is correctly displayed. But we don't want to see this
  //    undefined and hence we put the if clause there. Now after fixing this too, there is still one problem. When we close the MovieDetails component on the right box
  //    of the screen, the title of the movie that was opened in the MovieDetails component on the right box of the screen remains there. So the page title it is not set
  //    back to usePopcorn. This happens because nowhere in our code we are telling React to go back to usePopcorn title. So we need to ensure that the page title stays]
  //    synchronized with the application even after the component has disappeared. So we need to execute some code as the component unmounts. So we can do exactly that
  //    by returning a cleanup function from the effect. In this case that's simply a function that sets the title back to usePopcorn. (The cleanup function that we
  //    return from an effect is acually also executed on re-renders (So right before the effect is executed again and hence it runs on 2 occasions - when component
  //    unmounts and next effect execution))

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
        ></button>
      </div>
    </li>
  );
}
