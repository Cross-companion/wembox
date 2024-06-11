const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_SECRET,
  AWS_REGION,
  AWS_CHAT_IMAGES_FOLDER,
} = process.env;

const awsClient = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
  },
});

class ImageFile {
  constructor({
    image,
    uniqueID,
    prefix = 'not-prefixed',
    resize = [500, 500],
    quality = 100,
    folderName = AWS_CHAT_IMAGES_FOLDER,
  } = {}) {
    this.image = image;
    this.prefix = prefix;
    this.resize = resize;
    this.quality = quality;
    this.uniqueID = uniqueID;
    this.imageName = `${folderName}${prefix}-${uniqueID}-${Date.now()}.jpeg`;
  }

  async sharpify(fit = 'cover') {
    try {
      if (!this.image || !this.uniqueID)
        throw new Error('No Image buffer or unique id  Specified');
      const sharpenedToBuffer = await sharp(this.image.buffer)
        .resize(this.resize[0], this.resize[1], { fit })
        .toFormat('jpeg')
        .jpeg({ quality: this.quality })
        .toBuffer()
        .catch((err) => new Error(err.message));

      return sharpenedToBuffer;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async uploadToAWS({ useSharp = true } = {}) {
    if (!this.image || !this.uniqueID)
      throw new Error('No Image buffer or unique id  Specified');
    const imageBuffer = useSharp ? await this.sharpify() : this.image.buffer;

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: this.imageName,
      Body: imageBuffer,
      ContentType: this.image.mimetype,
    };
    const command = new PutObjectCommand(params);
    await awsClient.send(command).catch((err) => new Error(err.message));
  }

  async getFromAWS(imageUrl) {
    if (!imageUrl) throw new Error('No image path was specified @getFromAWS');
    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: imageUrl,
    };
    const command = new GetObjectCommand(params);
    const { Body, ContentType } = await awsClient.send(command);

    return { Body, ContentType };
  }
}

module.exports = ImageFile;
