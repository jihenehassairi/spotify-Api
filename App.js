import React, { useState, useEffect } from 'react';
import Dropdown from './Dropdown';
import Listbox from './Listbox';
import Detail from './Detail';
import { Credentials } from './Credentials';
import axios from 'axios';

const App = () => {

  const spotify = Credentials();  

  console.log('RENDERING APP.JS');

  const data = [
    {value: 1, name: 'A'},
    {value: 2, name: 'B'},
    {value: 3, name: 'C'},
  ]; 

  const [token, setToken] = useState('');  
  const [genres, setGenres] = useState({selectedGenre: '', listOfGenresFromAPI: []});
  const [playlist, setPlaylist] = useState({selectedPlaylist: '', listOfPlaylistFromAPI: []});
  const [tracks, setTracks] = useState({selectedTrack: '', listOfTracksFromAPI: []});
  const [trackDetail, setTrackDetail] = useState(null);

  useEffect(() => {

    axios('https://accounts.spotify.com/api/token', {
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Authorization' : 'Basic ' + btoa(spotify.ClientId + ':' + spotify.ClientSecret)      
      },
      data: 'grant_type=client_credentials',
      method: 'POST'
    })
    .then(tokenResponse => {      
      setToken(tokenResponse.data.access_token);

      axios('https://api.spotify.com/v1/browse/categories?locale=sv_US', {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + tokenResponse.data.access_token}
      })
      .then (genreResponse => {        
        setGenres({
          selectedGenre: genres.selectedGenre,
          listOfGenresFromAPI: genreResponse.data.categories.items
        })
      });
      
    });

  }, [genres.selectedGenre, spotify.ClientId, spotify.ClientSecret]); 

  const genreChanged = val => {
    setGenres({
      selectedGenre: val, 
      listOfGenresFromAPI: genres.listOfGenresFromAPI
    });

    axios(`https://api.spotify.com/v1/users/g83kmc6jj3g5y992vq7p615h6/playlists?limit=10`, {
      method: 'GET',
      headers: { 'Authorization' : 'Bearer ' + token}
    })
    .then(playlistResponse => {
      setPlaylist({
        selectedPlaylist: playlist.selectedPlaylist,
        listOfPlaylistFromAPI: playlistResponse.data.items
      })
    });

    console.log(playlist.selectedPlaylist);
  }

  const playlistChanged = val => {

    console.log(val);
    setPlaylist({
      selectedPlaylist: val,
      listOfPlaylistFromAPI: playlist.listOfPlaylistFromAPI
    });
  }

  const buttonClicked = e => {
    e.preventDefault();

    axios(`https://api.spotify.com/v1/playlists/${playlist.selectedPlaylist}/tracks?limit=100`, {
      method: 'GET',
      headers: {
        'Authorization' : 'Bearer ' + token
      }
    })
    .then(tracksResponse => {
      setTracks({
        selectedTrack: tracks.selectedTrack,
        listOfTracksFromAPI: tracksResponse.data.items
      })
    });
  }



  const listboxClicked = val => {
  console.log(playlist.selectedPlaylist)

    const currentTracks = [...tracks.listOfTracksFromAPI];

   

    const trackInfo = currentTracks.filter(t => t.track.id === val);
    setTrackDetail(trackInfo[0].track);
    console.log(trackDetail)



  }

  
  
  const link = "https://open.spotify.com/embed/playlist/" + playlist.selectedPlaylist;
  return (
    <div className="container">
      <form onSubmit={buttonClicked}>        
          <Dropdown label="Genre :" options={genres.listOfGenresFromAPI} selectedValue={genres.selectedGenre} changed={genreChanged} />
          <Dropdown label="Playlist :" options={playlist.listOfPlaylistFromAPI} selectedValue={playlist.selectedPlaylist} changed={playlistChanged} />
          <div className="col-sm-6 row form-group px-0">
            <button type='submit' className="btn btn-success col-sm-12">
              Search
            </button>
          </div>
          <div className="row">
            <Listbox items={tracks.listOfTracksFromAPI} clicked={listboxClicked} />
            {trackDetail && <Detail {...trackDetail} /> }
          </div>     
          <iframe src={link} width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
      </form>
    </div>
    
    
  );
}

export default App;