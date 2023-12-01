const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_SECRET,
  AWS_REGION,
  AWS_USER_IMAGES_FOLDER,
} = process.env;
const sharp = require('sharp');

const awsClient = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET,
  },
});

class ImageFile {
  constructor(
    image,
    uniqueID,
    prefix = 'not-prefixed',
    resize = [500, 500],
    quality = 90,
    folderName
  ) {
    if (!image || !uniqueID)
      throw new Error('No Image buffer or unique id  Specified');
    this.image = image;
    this.prefix = prefix;
    this.resize = resize;
    this.quality = quality;
    this.uniqueID = uniqueID;
    this.folderName = folderName;
    this.imageName = `${prefix}-${uniqueID}-${Date.now()}.jpeg`;
  }

  async sharpify(fit = 'contain') {
    try {
      const sharpenedToBuffer = await sharp(this.image.buffer)
        .resize(this.resize[0], this.resize[1])
        .toFormat('jpeg')
        .jpeg({ quality: this.quality })
        .fit(fit)
        .toBuffer()
        .catch((err) => new Error(err.message));

      return sharpenedToBuffer;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async uploadToAWS({ useSharp = true }) {
    const imageBuffer = useSharp ? await this.sharpify() : this.image.buffer;

    const params = {
      Bucket: AWS_BUCKET_NAME,
      Key: `${this.folderName || AWS_USER_IMAGES_FOLDER}${this.imageName}`,
      Body: imageBuffer,
      ContentType: this.image.mimetype,
    };
    const command = new PutObjectCommand(params);
    await awsClient.send(command).catch((err) => new Error(err.message));
  }
}

module.exports = ImageFile;
