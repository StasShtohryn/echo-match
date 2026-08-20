import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

const items = [
  {
    name: "q1",
    required: true,
    prompt: "фждівждфівждфів",
    description: "жівлждіва.",
    choices: [
      {
        value: "delegation",
        label: "фжівлвжфідв",
        description: "діловоаодліва",
      },
      {
        value: "questions",
        label: "СЧБЬМфів",
        description: "ючбьсмючс.",
      }
    ]
  },
  {
    name: "q2",
    required: true,
    prompt: "ФДІЛОВ?",
    description: "дфліовдлфідлв.",
    choices: [
      { value: "focused", label: "бсбсбсюсбюс" },
      { value: "complete", label: "чя.бюьсмьмс" },
    ],
  },
    {
    name: "q3",
    required: true,
    prompt: "яч.саьчсм?",
    description: "ядлчодлчс.",
    choices: [
      {
        value: "delegation",
        label: "фжівлвжфідв",
        description: "діловоаодліва",
      },
      {
        value: "questions",
        label: "СЧБЬМфів",
        description: "ючбьсмючс.",
      }
    ]
  },
] as const

export default function PsychologicQuizPage() {
  
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const answers = new FormData(event.currentTarget)
    // answers.get("direction"), answers.getAll(...) for multiple items.
  }
  
  return (
    <div className="max-w-4xl p-12 mx-auto">
      <Questionnaire items={items} onSubmit={handleSubmit}>
      <QuestionnaireProgress
        className="w-full"
        render={(props, state) => (
          <div {...props}>
            <div className="mb-2 flex gap-1.5" aria-hidden="true">
              {Array.from({ length: state.total }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < state.current
                      ? "h-1.5 flex-1 rounded-full bg-primary"
                      : "h-1.5 flex-1 rounded-full bg-muted"
                  }
                />
              ))}
            </div>
            <span>
              Питання {state.current} з {state.total}
            </span>
          </div>
        )}
      />
        {items.map((question) => (
          <QuestionnaireItem
            key={question.name}
            name={question.name}
            required={question.required}
          >
            <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
            <QuestionnaireDescription>
              {question.description}
            </QuestionnaireDescription>
            <QuestionnaireChoices>
              {question.choices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  <span className="font-medium">{choice.label}</span>
                  {"description" in choice ? (
                    <span className="text-muted-foreground">
                      {choice.description}
                    </span>
                  ) : null}
                </QuestionnaireChoice>
              ))}
              {"input" in question ? (
                <QuestionnaireInput
                  aria-label={question.input.label}
                  placeholder={question.input.placeholder}
                />
              ) : null}
            </QuestionnaireChoices>
            <QuestionnaireError />
          </QuestionnaireItem>
        ))}
        <QuestionnaireActions>
          <QuestionnairePrevious children="Попереднє" />
          <QuestionnaireSkip children="Пропустити" />
          <QuestionnaireNext children="Наступне"/>
          <QuestionnaireSubmit children="Завершити" />
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}
