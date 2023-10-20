import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { S3Event } from "aws-lambda"

const s3Client = new S3Client({ region: "eu-west-1" })
const sqsClient = new SQSClient({ region: "eu-west-1" })

export const handler = async (event: S3Event) => {
  console.log(event.Records[0].s3.object.key)
  console.log(event.Records[0].s3)

  const s3Record = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: event.Records[0].s3.object.key,
    })
  )

  const processingItem = {
    key: event.Records[0].s3.object.key,
    bucketName: event.Records[0].s3.bucket.name,
  }

  const command = new SendMessageCommand({
    QueueUrl: process.env.PROCESSING_QUEUE_URL,
    MessageBody: JSON.stringify(processingItem),
    MessageGroupId: event.Records[0].s3.object.versionId,
  })

  const result = await sqsClient.send(command)
  console.log(result)
}
