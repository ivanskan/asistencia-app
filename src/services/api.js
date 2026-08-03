////dev

// const API = "/Sistema/Api";


//// prod

// const API = "https://ersperu.pe/Sistema/Api";

// export default API;



////////////// Config to dev and prod /////////////////////

const API = import.meta.env.VITE_API_URL;

export default API;


///////////////////////////////////////////////////////////