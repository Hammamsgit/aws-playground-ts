import { IndexFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition"

const rekognitionClient = new RekognitionClient({ region: "us-east-1" })

export const processImage = async () => {
  const indexFace = await rekognitionClient.send(
    new IndexFacesCommand({
      CollectionId: "test-collection",
      DetectionAttributes: [],
      ExternalImageId: "test-image",
      Image: {
        S3Object: {
          Bucket: "test-bucket",
          Name: "test-image",
        },
      },
    })
  )
}

export const handler = async (event: unknown) => {
  await processImage()
}
