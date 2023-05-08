import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchactions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
//import { aws_logs as logs} from 'aws-cdk-lib';

export class NetworkAddressMonitorStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
     // Define the VPC and subnet IDs
     const vpcId = 'vpc-06d0b335ef8695815';
     const subnetId = 'subnet-06b853a400484747f';

     // Create the CloudWatch alarm
     const alarm = new cloudwatch.Alarm(this, 'NetworkAddressAvailabilityAlarm', {
       metric: new cloudwatch.Metric({
         namespace: 'AWS/EC2',
         metricName: 'AvailableIPAddressCount',
         dimensionsMap: {
           VpcId: vpcId,
           SubnetId: subnetId,
         },
         statistic: 'Minimum',
         period: cdk.Duration.minutes(5),
       }),
       threshold: 100,
       evaluationPeriods: 1,
       comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
       alarmName: 'IpMonitoringAlarm',
       alarmDescription: 'Alarm triggered when the number of available IPs in the subnet falls below 100.',
       actionsEnabled: true,
     });
 
     // Create the SNS topic
     const topic = new sns.Topic(this, 'NetworkAddressAvailabilityTopic');
     topic.addSubscription(new subscriptions.EmailSubscription('fofafranck@yahoo.fr'));
 
     // Create the IAM role for CloudWatch to publish to SNS
     const role = new iam.Role(this, 'NetworkAddressAvailabilityRole', {
       assumedBy: new iam.ServicePrincipal('cloudwatch.amazonaws.com'),
     });
     role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        'sns:Publish',
        'cloudwatch:GetMetricData',
        'cloudwatch:GetMetricStatistics',
        'cloudwatch:DescribeAlarms',
        'ec2:DescribeSubnets',
      ],
     }));
 
     // Allow CloudWatch to publish to SNS
     topic.grantPublish(role);
 
     // Create the CloudWatch action to publish to SNS
     const action = new cloudwatchactions.SnsAction(topic);
 
     // Add the action to the alarm
     alarm.addAlarmAction(action);

     // Output the ARN of the SNS topic and the ARN of the IAM role
     new cdk.CfnOutput(this, 'TopicArn', { value: topic.topicArn });
     new cdk.CfnOutput(this, 'RoleArn', { value: role.roleArn });
   }
 }
 