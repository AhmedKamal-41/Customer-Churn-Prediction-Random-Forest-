import Card from '../ui/Card'

export default function AboutPage() {
  return (
    <div className="max-w-2xl w-full">
      <Card title="About">
        <p className="text-text text-sm">
          Churn Assistant helps you assess customer churn risk by collecting a few key details in a conversational way.
          Answer the questions in the chat to get a prediction and retention recommendations.
        </p>
      </Card>
    </div>
  )
}
