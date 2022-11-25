import React, { useState } from "react";
import firebase from "firebase/compat/app";
import { auth, firestore, storage } from "../services/firebase";
import { uploadBytes } from "firebase/storage";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ChatMessage from "./ChatMessage";
import { Container } from "react-bootstrap";
import { v4 } from "uuid";

function ChatRoom({ user }) {
  // form management
  const [formValue, setFormValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  // fetch messages in firestore collection
  const messagesRef = firestore.collection("messages");
  // create query
  const query = messagesRef.orderBy("createdAt").limit(25);
  // listen to messages received
  const [messages] = useCollectionData(query, { idField: "id" });

  const sendMessage = async (event) => {
    const { uid, photoURL } = auth.currentUser;
    let imagePath = "";

    const fileImage = event.target.files[0];

    if (fileImage) {
      // create ref, randomize filename
      const imageRef = storage.ref(`images/${fileImage.name + v4()}`);
      const uploadResult = await uploadBytes(imageRef, fileImage);
      imagePath = uploadResult.metadata.name;
    }
    messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
      userImageURL: imagePath,
    });

    // reset values
    setFormValue("");
    setImageValue("");
  };

  return (
    <>
      <Container>
        {messages &&
          messages.map((msg, idx) => {
            return <ChatMessage message={msg} key={idx} />;
          })}
      </Container>
      <div
        style={{
          backgroundColor: "#f8f8f8",
          position: "absolute",
          width: "100%",
          bottom: "0px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            width: "100%",
          }}
        >
          <input
            placeholder="Enter a message..."
            style={{ flexGrow: 2, padding: "10px" }}
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            type={"text"}
          />
          <button style={{ flexGrow: 1 }} onClick={sendMessage}>
            Send
          </button>
          <input
            style={{ width: "1rem", flexGrow: 1, padding: "10px" }}
            type="file"
            id="image"
            name="image"
            accept="image/*"
            value={imageValue}
            onChange={(e) => setImageValue(e.target.value)}
          ></input>
        </div>
      </div>
    </>
  );
}

export default ChatRoom;
