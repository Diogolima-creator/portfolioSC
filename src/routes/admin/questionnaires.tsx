import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createQuestionnaire, updateQuestionnaire, getAllQuestionnaires, getSubmissions, type Questionnaire, type Question } from '../../services/firebase'

export const Route = createFileRoute('/admin/questionnaires' as never)({
  component: AdminQuestionnaires,
})

function AdminQuestionnaires() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | null>(null)
  const [submissionCount, setSubmissionCount] = useState<Record<string, number>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingResponses, setViewingResponses] = useState<string | null>(null)
  const [responses, setResponses] = useState<any[]>([])

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    { text: '', type: 'text', required: true }
  ])

  useEffect(() => {
    loadQuestionnaires()
  }, [])

  async function loadQuestionnaires() {
    try {
      setLoading(true)
      const data = await getAllQuestionnaires()
      setQuestionnaires(data)

      // Load submission counts
      const counts: Record<string, number> = {}
      for (const q of data) {
        const submissions = await getSubmissions(q.id)
        counts[q.id] = submissions.length
      }
      setSubmissionCount(counts)
    } catch (err) {
      console.error('Error loading questionnaires:', err)
    } finally {
      setLoading(false)
    }
  }

  function addQuestion() {
    setQuestions([...questions, { text: '', type: 'text', required: true }])
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, field: keyof Omit<Question, 'id'>, value: string | boolean | string[]) {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }

    // Initialize options array when switching to choice type
    if (field === 'type' && (value === 'single-choice' || value === 'multiple-choice')) {
      if (!newQuestions[index].options) {
        newQuestions[index].options = ['']
      }
    }

    setQuestions(newQuestions)
  }

  function addOption(questionIndex: number) {
    const newQuestions = [...questions]
    if (!newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options = []
    }
    newQuestions[questionIndex].options!.push('')
    setQuestions(newQuestions)
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options = newQuestions[questionIndex].options!.filter((_, i) => i !== optionIndex)
    setQuestions(newQuestions)
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options![optionIndex] = value
    setQuestions(newQuestions)
  }

  function startEdit(questionnaire: Questionnaire) {
    setEditingId(questionnaire.id)
    setTitle(questionnaire.title)
    setDescription(questionnaire.description)
    setQuestions(questionnaire.questions.map(q => ({
      text: q.text,
      type: q.type,
      required: q.required,
      options: q.options
    })))
    setShowForm(true)
    setError(null)
    setSuccess(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setQuestions([{ text: '', type: 'text', required: true }])
    setShowForm(false)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !description.trim()) {
      setError('Título e descrição são obrigatórios')
      return
    }

    if (questions.length === 0) {
      setError('Adicione pelo menos uma pergunta')
      return
    }

    const invalidQuestions = questions.filter(q => !q.text.trim())
    if (invalidQuestions.length > 0) {
      setError('Todas as perguntas devem ter um texto')
      return
    }

    try {
      setSubmitting(true)

      if (editingId) {
        // Update existing questionnaire
        await updateQuestionnaire(editingId, title, description, questions)
        setSuccess(`Questionário atualizado com sucesso!`)
      } else {
        // Create new questionnaire
        const id = await createQuestionnaire(title, description, questions)
        setSuccess(`Questionário criado com sucesso! ID: ${id}`)
      }

      // Reset form
      setEditingId(null)
      setTitle('')
      setDescription('')
      setQuestions([{ text: '', type: 'text', required: true }])
      setShowForm(false)

      // Reload questionnaires
      await loadQuestionnaires()
    } catch (err) {
      setError(editingId ? 'Erro ao atualizar questionário. Tente novamente.' : 'Erro ao criar questionário. Tente novamente.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/interview-client/${id}`
    navigator.clipboard.writeText(url)
    setSelectedQuestionnaire(id)
    setTimeout(() => setSelectedQuestionnaire(null), 2000)
  }

  async function viewResponses(questionnaireId: string) {
    try {
      const submissions = await getSubmissions(questionnaireId)
      setResponses(submissions)
      setViewingResponses(questionnaireId)
    } catch (err) {
      console.error('Error loading responses:', err)
      setError('Erro ao carregar respostas')
    }
  }

  function closeResponsesModal() {
    setViewingResponses(null)
    setResponses([])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando questionários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciar Questionários</h1>
            <p className="text-muted-foreground">Crie e gerencie questionários para seus clientes</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Voltar ao Site
          </a>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-primary text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <button
            onClick={() => {
              if (showForm) {
                cancelEdit()
              } else {
                setShowForm(true)
              }
            }}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancelar' : 'Criar Novo Questionário'}
          </button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Editar Questionário' : 'Novo Questionário'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Pesquisa de Satisfação do Cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Descreva o objetivo deste questionário"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium">Perguntas</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-primary hover:text-primary/90 text-sm font-medium"
                  >
                    + Adicionar Pergunta
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm font-medium">Pergunta {index + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-destructive hover:text-destructive/90 text-sm"
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Digite a pergunta"
                          required
                        />

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-xs text-muted-foreground mb-1">
                              Tipo de Resposta
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="text">Texto Curto</option>
                              <option value="textarea">Texto Longo</option>
                              <option value="single-choice">Múltipla Escolha (Uma resposta)</option>
                              <option value="multiple-choice">Múltipla Escolha (Várias respostas)</option>
                              <option value="file">Arquivo/Imagem</option>
                              <option value="audio">Áudio</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                              />
                              <span className="text-sm">Obrigatória</span>
                            </label>
                          </div>
                        </div>

                        {(question.type === 'text' || question.type === 'textarea') && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer mb-3">
                              <input
                                type="checkbox"
                                checked={question.allowMedia || false}
                                onChange={(e) => updateQuestion(index, 'allowMedia', e.target.checked)}
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary"
                              />
                              <span className="text-sm font-medium">Permitir anexo de mídia</span>
                            </label>

                            {question.allowMedia && (
                              <div className="ml-6">
                                <label className="block text-xs text-muted-foreground mb-2">
                                  Tipo de mídia permitido
                                </label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`media-type-${index}`}
                                      value="image"
                                      checked={question.mediaType === 'image' || !question.mediaType}
                                      onChange={(e) => updateQuestion(index, 'mediaType', e.target.value)}
                                      className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">Imagem</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`media-type-${index}`}
                                      value="audio"
                                      checked={question.mediaType === 'audio'}
                                      onChange={(e) => updateQuestion(index, 'mediaType', e.target.value)}
                                      className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">Áudio</span>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <label className="text-sm font-medium">Alternativas</label>
                              <button
                                type="button"
                                onClick={() => addOption(index)}
                                className="text-primary hover:text-primary/90 text-xs font-medium"
                              >
                                + Adicionar Alternativa
                              </button>
                            </div>

                            <div className="space-y-2">
                              {question.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                    placeholder={`Alternativa ${optionIndex + 1}`}
                                    required
                                  />
                                  {question.options && question.options.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeOption(index, optionIndex)}
                                      className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}

                              <div className="mt-3 p-3 bg-background border border-border rounded-lg">
                                <div className="flex items-center gap-2">
                                  <input
                                    type={question.type === 'single-choice' ? 'radio' : 'checkbox'}
                                    disabled
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm text-muted-foreground">Outro:</span>
                                  <input
                                    type="text"
                                    disabled
                                    className="flex-1 px-3 py-1 bg-muted border border-border rounded text-sm"
                                    placeholder="Campo de texto para 'Outro'"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  * A opção "Outro" com campo de texto será adicionada automaticamente
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? (editingId ? 'Atualizando...' : 'Criando...')
                    : (editingId ? 'Atualizar Questionário' : 'Criar Questionário')
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold">Questionários Criados</h2>
          </div>

          {questionnaires.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum questionário criado ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {questionnaires.map((q) => (
                <div key={q.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{q.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{q.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{q.questions.length} pergunta(s)</span>
                        <span>•</span>
                        <span>{submissionCount[q.id] || 0} resposta(s)</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => viewResponses(q.id)}
                        className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                        disabled={submissionCount[q.id] === 0}
                      >
                        Ver Respostas ({submissionCount[q.id] || 0})
                      </button>
                      <button
                        onClick={() => startEdit(q)}
                        className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => copyLink(q.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        {selectedQuestionnaire === q.id ? 'Copiado!' : 'Copiar Link'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Link do Questionário:</p>
                    <code className="text-sm break-all">
                      {window.location.origin}/interview-client/{q.id}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Responses Modal */}
        {viewingResponses && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Respostas do Questionário</h2>
                <button
                  onClick={closeResponsesModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {responses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">Nenhuma resposta ainda</p>
                ) : (
                  <div className="space-y-6">
                    {responses.map((submission, index) => (
                      <div key={submission.id} className="border border-border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Resposta #{index + 1}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div className="space-y-4">
                          {submission.answers.map((answer: any) => {
                            const question = questionnaires
                              .find(q => q.id === viewingResponses)
                              ?.questions.find(q => q.id === answer.questionId)

                            return (
                              <div key={answer.id} className="border-l-2 border-primary pl-4">
                                <p className="font-medium mb-2">{question?.text || 'Pergunta não encontrada'}</p>
                                <p className="text-muted-foreground">{answer.answer}</p>
                                {answer.fileUrls && answer.fileUrls.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {answer.fileUrls.map((url: string, i: number) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-primary hover:underline text-sm"
                                      >
                                        📎 Ver arquivo {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={closeResponsesModal}
                  className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
