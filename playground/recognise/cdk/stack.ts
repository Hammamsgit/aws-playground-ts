import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs"
import path from "path"
import { PlaygroundStackProps } from "bootstrap/types"
import { BlockPublicAccess, Bucket, EventType, StorageClass } from "aws-cdk-lib/aws-s3"
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications"
import { Runtime } from "aws-cdk-lib/aws-lambda"
import { Queue } from "aws-cdk-lib/aws-sqs"
import { S3EventSource, SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources"
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib"

export class PlaygroundStack extends Stack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id, props)

    const { buildName } = props

    const imageUploadBucket = new Bucket(this, "ImageUploadBucket", {
      bucketName: buildName("image-upload-bucket"),
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: Duration.days(30),
          transitions: [
            {
              storageClass: StorageClass.GLACIER,
              transitionAfter: Duration.days(20),
            },
          ],
        },
      ],
    })

    const processingDLQ = new Queue(this, "mot-processing-dlq", {
      queueName: `${buildName("processing-dlq")}.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
    })

    const processingQueue = new Queue(this, "mot-processing-queue", {
      queueName: `${buildName("processing")}.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        queue: processingDLQ,
        maxReceiveCount: 3,
      },
    })

    const getImageFromBucketLambda = new NodejsFunction(this, "getImageFromBucket", {
      functionName: buildName("get-image-from-bucket"),
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../src/get-image.ts"),
      environment: {
        BUCKET_NAME: imageUploadBucket.bucketName,
      },
    })

    const processImageLambda = new NodejsFunction(this, "processImage", {
      functionName: buildName("process-image"),
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../src/process-image.ts"),
      environment: {
        QUEUE_URL: processingQueue.queueUrl,
      },
    })

    imageUploadBucket.grantRead(getImageFromBucketLambda)
    // imageUploadBucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(getImageFromBucketLambda), { suffix: ".jpg" })
    getImageFromBucketLambda.addEventSource(new S3EventSource(imageUploadBucket, { events: [EventType.OBJECT_CREATED], filters: [{ suffix: ".jpg" }] }))

    processingQueue.grantSendMessages(processImageLambda)
    processingQueue.grantConsumeMessages(processImageLambda)

    processImageLambda.addEventSource(new SqsEventSource(processingQueue, { batchSize: 1 }))
  }
}
