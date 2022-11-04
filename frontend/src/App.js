import React from 'react';
import './App.css';


class App extends React.Component {
  constructor(props){
    super(props);
      this.state = {
        wordList:[],
        activeItem:{
          id:null, 
          title:'',
          completed:false,
        },
        editing:false,
      }
      this.fetchWords = this.fetchWords.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.getCookie = this.getCookie.bind(this)


      this.startEdit = this.startEdit.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.strikeUnstrike = this.strikeUnstrike.bind(this)
  };

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  componentWillMount(){
    this.fetchWords()
  }

  fetchWords(){
    console.log('Fetching...')

    fetch('http://127.0.0.1:8000/api/word-list/')
    .then(response => response.json())
    .then(data => 
      this.setState({
        wordList:data
      })
      )
  }

  handleChange(e){
    var name = e.target.name
    var value = e.target.value
    console.log('Name:', name)
    console.log('Value:', value)

    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title:value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()
    console.log('ITEM:', this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    var url = 'http://127.0.0.1:8000/api/word-create/'

    if(this.state.editing == true){
      url = `http://127.0.0.1:8000/api/word-update/${ this.state.activeItem.id}/`
      this.setState({
        editing:false
      })
    }



    fetch(url, {
      method:'POST',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
      body:JSON.stringify(this.state.activeItem)
    }).then((response)  => {
        this.fetchWords()
        this.setState({
           activeItem:{
          id:null, 
          title:'',
          completed:false,
        }
        })
    }).catch(function(error){
      console.log('ERROR:', error)
    })

  }

  startEdit(word){
    this.setState({
      activeItem:word,
      editing:true,
    })
  }


  deleteItem(word){
    var csrftoken = this.getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/word-delete/${word.id}/`, {
      method:'DELETE',
      headers:{
        'Content-type':'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) =>{

      this.fetchWords()
    })
  }


  strikeUnstrike(word){

    word.completed = !word.completed
    var csrftoken = this.getCookie('csrftoken')
    var url = `http://127.0.0.1:8000/api/word-update/${word.id}/`

      fetch(url, {
        method:'POST',
        headers:{
          'Content-type':'application/json',
          'X-CSRFToken':csrftoken,
        },
        body:JSON.stringify({'completed': word.completed, 'title':word.title})
      }).then(() => {
        this.fetchWords()
      })

    console.log('WORD:', word.completed)
  }


  render(){
    var words = this.state.wordList
    var self = this
    return(
        <div className="container">
          <div className='pageTitle'>
            <h1>Trigger Warning App</h1>
            <span>An app that lets Reddit Moderators remove posts based off of submitted words</span>
          </div>
          <div id="word-container">
              <div  id="form-wrapper">
                <h2>Remove Posts / Comments</h2>
                 <form onSubmit={this.handleSubmit}  id="form">
                    <div className="flex-wrapper">
                        <div style={{flex: 6}}>
                            <input onChange={this.handleChange} className="form-control" id="title" value={this.state.activeItem.title} type="text" name="title" placeholder="Add Removal Word.." />
                         </div>

                         <div style={{flex: 1}}>
                            <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                          </div>
                      </div>
                </form>
             
              </div>

              <div  id="list-wrapper">         
                    {words.map(function(word, index){
                      return(
                          <div key={index} className="word-wrapper flex-wrapper">

                            <div onClick={() => self.strikeUnstrike(word)} style={{flex:7}}>

                                {word.completed == false ? (
                                    <span>{word.title}</span>

                                  ) : (

                                    <strike>{word.title}</strike>
                                  )}
  
                            </div>

                            <div style={{flex:1}}>
                                <button onClick={() => self.startEdit(word)} className="btn btn-sm btn-outline-info">Edit</button>
                            </div>

                            <div style={{flex:1}}>
                                <button onClick={() => self.deleteItem(word)} className="btn btn-sm btn-outline-dark delete">-</button>
                            </div>

                          </div>
                        )
                    })}
              </div>
          </div>
          
        </div>
      )
  }
}



export default App;
