import React, { Component } from "react";
import { getMedias } from "api";

interface IMedia {
  testId?: string;
}

 export class MediaModal extends Component<IMedia> {
  state={base64String:''}

   constructor(props) {
     super(props);
    }
  
    fetchMedia = async () => {
      getMedias(this.props.testId)
        .then(res => {
            this.setState({base64String: `${res}`})
            // console.log(this.state.base64String);
          })
    };
  
    render() {

        return (
          <div>
            {
              this.state.base64String == "" ?
                  <button 
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button" 
                    onClick={() => {
                      if(this.state.base64String == ""){
                              this.fetchMedia();
                      };
                    }}  
                  >View Image </button>

              :
                <img src={this.state.base64String} />
            }
          </div>  

        )
      }
  }
