import multer from 'multer';
import path from 'path';
import { S3Client} from'@aws-sdk/client-s3'

const multerS3 = require('multer-s3')

const s3 = new S3Client({
  credentials: {
    secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY!
  },
  region: process.env.AWS_S3_REGION!
})


const storage = multerS3({
  s3: s3,
  bucket: process.env.S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req:any, file:any, cb:any) {
    cb(null, {fieldName: file.fieldname});
  },
  key: function (req:any, file:any, cb:any) {
    cb(null, Date.now().toString())
  }
})
  

  function checkFileType(file:any, cb:any) {
    const filetypes = /jpeg|jpg|png|png/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);
    

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only (jpeg, jpg, png, png)!');
    }
  }

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }); 
  
 export  const uploadMiddleWare = upload


 
  