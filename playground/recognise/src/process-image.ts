import { IndexFacesCommand, RekognitionClient } from "@aws-sdk/client-rekognition"
import { ProxyResource } from "aws-cdk-lib/aws-apigateway"
import { SQSEvent } from "aws-lambda"

const rekognitionClient = new RekognitionClient({ region: "us-east-1" })

export interface ProcessingItem {
  key: string
  bucketName: string
  body: Buffer
}

export const processImage = async (processingItem: ProcessingItem) => {
  const indexFace = await rekognitionClient.send(
    new IndexFacesCommand({
      CollectionId: "test-collection",
      DetectionAttributes: [],
      ExternalImageId: "test-image",
      Image: {
        S3Object: {
          Bucket: processingItem.bucketName,
          Name: "hammam.jpeg",
        },
      },
    })
  )
}

export const handler = async (event: SQSEvent) => {
  const processingItem = JSON.parse(event.Records[0].body) as ProcessingItem
  await processImage(processingItem)
}
