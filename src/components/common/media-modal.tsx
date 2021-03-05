import React, { Component } from "react";
import { getMedias } from "src/api";
import { Button } from "react-bootstrap";
import { Spinner } from "src/components/";
import { Modal } from "src/components";

interface IMedia {
  testId?: string;
}

export class MediaModal extends Component<IMedia> {
  state = {
    base64String: "",
    isOpen: false,
  };

  constructor(props) {
    super(props);
  }

  openModal = () => this.setState({ isOpen: true });

  closeModal = () => this.setState({ isOpen: false });

  fetchMedia = async () => {
    getMedias(this.props.testId).then((res) => {
      this.setState({ base64String: `${res}` });
    });
    // if (typeof this.state.base64String === "string") {
    //   console.log("hoy se come");
    // } else {
    //   console.log("hoy no se come");
    // }
  };

  render() {
    return (
      <>
        <div className="d-flex align-items-center justify-content-center">
          {
            <Button
              className="block w-full lg:inline-block lg:w-auto px-4 py-3 lg:py-2 bg-indigo-300 rounded-lg font-semibold text-sm text-gray-800 mt-4 lg:mt-0 lg:order-1"
              variant="primary"
              onClick={() => {
                this.openModal();

                if (this.state.base64String == "") {
                  this.fetchMedia();
                }
              }}
            >
              View Image
            </Button>
          }
        </div>

        <Modal visible={this.state.isOpen} onClose={() => {}}>
          <div className={`${this.state.base64String == "" ? "" : "h-screen"} text-center shadow-2xl`}>
            <div
              className="bg-gray-200 inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform sm:align-middle"
              style={{ height: "96%" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {this.state.base64String == "" ? (
                <div className="flex-center flex-1">
                  <Spinner className="m-5 h-10 w-10 text-gray-500" />
                </div>
              ) : (
                <div className="h-full">
                  <img
                    style={{ height: "96%" }}
                    src={this.state.base64String}
                  />
                  <div
                    onClick={this.closeModal}
                    style={{ height: "4%" }}
                    className="w-full text-center float-right text-white font-bold cursor-pointer bg-red-600 transition duration-300 hover:bg-red-700"
                  >
                    Close
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
