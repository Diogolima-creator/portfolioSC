import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getAllFeedbacks, getAllQuestionnaires, type QuestionnaireFeedback, type Questionnaire } from '../../services/firebase'
import AdminHeader from '../../components/AdminHeader'

export const Route = createFileRoute('/admin/feedbacks' as never)({
  component: AdminFeedbacks,
})

function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Record<string, QuestionnaireFeedback[]>>({})
  const [questionnaires, setQuestionnaires] = useState<Record<string, Questionnaire>>({})
  const [loading, setLoading] = useState(true)
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<string | 'all'>('all')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      
      // Load feedbacks and questionnaires in parallel
      const [feedbacksData, questionnairesData] = await Promise.all([
        getAllFeedbacks(),
        getAllQuestionnaires()
      ])
      
      setFeedbacks(feedbacksData)
      
      // Convert questionnaires array to object for easy lookup
      const questionnairesMap: Record<string, Questionnaire> = {}
      questionnairesData.forEach(q => {
        questionnairesMap[q.id] = q
      })
      setQuestionnaires(questionnairesMap)
    } catch (err) {
      console.error('Error loading feedbacks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  function getStats() {
    let totalFeedbacks = 0
    let totalRating = 0
    
    Object.values(feedbacks).forEach(feedbackList => {
      feedbackList.forEach(f => {
        totalFeedbacks++
        totalRating += f.rating
      })
    })
    
    return {
      total: totalFeedbacks,
      average: totalFeedbacks > 0 ? (totalRating / totalFeedbacks).toFixed(1) : '0.0'
    }
  }

  // Get filtered feedbacks
  function getFilteredFeedbacks(): { feedback: QuestionnaireFeedback; questionnaireName: string }[] {
    const result: { feedback: QuestionnaireFeedback; questionnaireName: string }[] = []
    
    Object.entries(feedbacks).forEach(([questionnaireId, feedbackList]) => {
      if (selectedQuestionnaire === 'all' || selectedQuestionnaire === questionnaireId) {
        feedbackList.forEach(feedback => {
          result.push({
            feedback,
            questionnaireName: questionnaires[questionnaireId]?.title || 'Questionário removido'
          })
        })
      }
    })
    
    // Sort by date (newest first)
    return result.sort((a, b) => 
      new Date(b.feedback.submittedAt).getTime() - new Date(a.feedback.submittedAt).getTime()
    )
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/30'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
      </div>
    )
  }

  const stats = getStats()
  const filteredFeedbacks = getFilteredFeedbacks()

  if (loading) {
    return (
      <>
        <AdminHeader />
        <div className="min-h-screen bg-background flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando feedbacks...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-background pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Feedbacks</h1>
              <p className="text-muted-foreground">Veja o que os usuários acharam das pesquisas</p>
            </div>
            <a
              href="/admin/questionnaires"
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Voltar aos Questionários
            </a>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Feedbacks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média de Avaliação</p>
                  <p className="text-2xl font-bold">{stats.average} / 5.0</p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questionários Avaliados</p>
                  <p className="text-2xl font-bold">{Object.keys(feedbacks).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <select
              value={selectedQuestionnaire}
              onChange={(e) => setSelectedQuestionnaire(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os questionários</option>
              {Object.values(questionnaires).map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* Feedbacks List */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Todos os Feedbacks</h2>
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-muted-foreground">Nenhum feedback recebido ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredFeedbacks.map(({ feedback, questionnaireName }) => (
                  <div key={feedback.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-sm font-medium text-primary">{questionnaireName}</span>
                        <div className="mt-1">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(feedback.submittedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    {feedback.comment && (
                      <p className="text-foreground bg-muted/50 p-3 rounded-lg mt-3">
                        "{feedback.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
