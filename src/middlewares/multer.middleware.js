import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
      //here the null value indicates that there was no error during operation
    },
    filename: function (req, file, cb) {
      // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      // cb(null, file.fieldname + '-' + uniqueSuffix)
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ storage })