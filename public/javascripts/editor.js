
const editor = new EditorJS({
  tools: {
    header: {
      class: Header,
      config: {
        placeholder: "Enter a header",
        levels: [1, 2, 3, 4, 5, 6],
        defaultLevel: 1,
      },
    },

    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: "http://localhost:3000/uploadFile", // Your backend file uploader endpoint
          byUrl: "http://localhost:3000/fetchUrl", // Your endpoint that provides uploading by Url
        },
        field: "avatar",
        type: "image/*",
      },
    },
    embed: {
      class: Embed,
      inlineToolbar: false,
      config: {
        services: {
          youtube: true,
          coub: true,
        },
      },
    },
    
  },
});

const savbtn = document.querySelector("button");
savbtn.addEventListener("click", function () {
  editor
      .save()
      .then(async (response) => {
          const { data } = await axios.post(
              "http://localhost:3000/write",
              response.blocks
          );
          window.location.href = "http://localhost:3000/profile";
      })
      .catch((err) => console.log(err));
});