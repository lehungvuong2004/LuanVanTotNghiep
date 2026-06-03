import axios from "axios";
import axios from "axios"

export const getUser = async () => {
  try {
    // const token = localStorage.getItem("token");
    // const response = await axios.get("https://jsonplaceholder.typicode.com/posts/1",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     }
    //   }
    // )
    // const response = await axios.post("https://jsonplaceholder.typicode.com/posts/1")
    // const response = await axios.delete("https://jsonplaceholder.typicode.com/posts/1")
    // const response = await axios.put("https://jsonplaceholder.typicode.com/posts/1")
    // return response.data;
    const api = axios.create({

    })
  }
  catch (error) {
    console.log("Error while fetching user data", error);
  }
}