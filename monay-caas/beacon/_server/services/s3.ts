import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({});

const bucketName = process.env.MEDIA_REPO_PATH ?? "";

const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    metadata: function meta(req, file, cb) {
      cb(null, {});
    },
    key: function key(req, file, cb) {
      cb(null, `${file.originalname}-${Date.now().toString()}`);
    },
  }),
});

export const deleteFilesFromS3 = async (key: string) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return `File with key ${key} deleted successfully from S3`;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erorr in deleting files from S3",
    });
  }
};

export const getFileFromS3 = async (key: string) => {
  try {
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return Body;
  } catch (error) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `No data found in S3 corresponding to key ${key}`,
    });
  }
};

export const getFilesFromS3 = async (keyList: Array<string>) => {
  try {
    const s3Data = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    const result = s3Data.Contents.filter((object) => {
      keyList.includes(object.Key);
    });
    return result;
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error while geting list of files from S3",
    });
  }
};
//For update file, we can use delete and then upload file dunction respectively

export default uploadToS3;
