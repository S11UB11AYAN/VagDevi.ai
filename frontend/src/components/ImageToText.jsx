import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Navbar from "./Navbar"; 
import axios from "axios"; 

const ImageToText = () => {
  const [responseData, setResponseData] = useState(null);
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [responseImage, setResponseImage] = useState(null);
  const { userId } = useParams();
  const accessToken = localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [promptVal, setPromptVal] = useState(""); 
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handlePromptChange = (event) => {
    const value = event.target.value;
    setPrompt(value);
    setPromptVal(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!image || !prompt) {
      console.error("No image or prompt provided");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", prompt);

    const base64Image = await convertFileToBase64(image);

    const requestData = {
      img: {
        filename: image.name,
        data: base64Image,
      },
      prompt: prompt,
    };

    try {
      const response = await axios.post(
        `http://localhost:8080/chats/image/${userId}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setResponseText(response.data.text);
      setResponseImage(response.data.image);
      setResponseData(response.data.responseData);
      setPrompt("");
      fetchChats(); 
    } catch (error) {
      console.error("Error uploading image:", error.response.data);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result.split(",")[1]);
      fileReader.onerror = (error) => reject(error);
    });
  };

  return (
    <>
      <Navbar userId={userId} /> 
      <div className="fixed inset-0 flex justify-center items-center overflow-hidden">
        <div className="w-[1200px] max-w-lg bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Image to Text</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex">
              {" "}
             
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-700 hover:border-gray-500 cursor-pointer"
                >
                  Choose File
                </label>

                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Uploaded Image Preview"
                    className="mt-2 rounded-md"
                    style={{ maxWidth: "100%", maxHeight: "200px" }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-row">
              <div className="mb-4 w-[500px]">
                <TextField
                  type="text"
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Enter prompt here"
                  fullWidth
                  variant="outlined"
                  size="small"
                  className="w-[300px]"
                />
              </div>
              <div>
                <IconButton type="submit">
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </form>
          {responseData && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Prompt:</p>
              <p className="mt-1 text-sm text-gray-500">{promptVal}</p>
              <p className="mt-2 text-sm font-medium text-gray-700">
                Response Data:
              </p>
              <div
                className="w-full max-w-md overflow-y-auto"
                style={{ maxHeight: "200px" }} 
              >
                <p className="mt-1 text-sm text-gray-500">{responseData}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ImageToText;
