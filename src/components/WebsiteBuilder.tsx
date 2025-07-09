import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Code,
  Download,
  LogOut,
  Zap,
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { blink } from '@/blink/client'

interface User {
  email: string
  username: string
}

interface WebsiteBuilderProps {
  user: User
  onLogout: () => void
}

interface ProjectFile {
  name: string
  type: 'html'
  content: string
}

interface GenerationStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
}

const SYSTEM_PROMPT = `You are an elite, advanced web developer and designer. You generate advanced, fully fledged, modern, visually impressive, and highly functional websites. Always include all HTML, CSS, and JavaScript within a single HTML file. When asked to improve or fix an existing website, analyze the current code and make meaningful, professional, and sophisticated enhancements. Never omit essential website elements. IMPORTANT: Your reply MUST be ONLY the full HTML code, with no markdown, no code block, no commentary, and no explanations0just the raw code. Do NOT include any `

export function WebsiteBuilder({ user, onLogout }: WebsiteBuilderProps) {
  const { theme, toggleTheme } = useTheme()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [generatedFile, setGeneratedFile] = useState<ProjectFile | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const generateWebsite = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedFile(null)
    setPreviewHtml('')

    const steps: GenerationStep[] = [
      { id: '1', title: 'Sending request to AI', status: 'pending', progress: 0 },
      { id: '2', title: 'Receiving AI response', status: 'pending', progress: 0 },
      { id: '3', title: 'Processing response', status: 'pending', progress: 0 }
    ]

    setGenerationSteps(steps)

    try {
      // Step 1: Sending request
      steps[0].status = 'running'
      setGenerationSteps([...steps])

      const response = await blink.ai.generateText({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 16384
      })

      steps[0].progress = 100
      steps[0].status = 'completed'
      steps[1].status = 'running'
      setGenerationSteps([...steps])

      // Simulate receiving response progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 100))
        steps[1].progress = p
        setGenerationSteps([...steps])
      }

      steps[1].status = 'completed'
      steps[2].status = 'running'
      setGenerationSteps([...steps])

      // Process response
      const htmlCode = response.text.trim()

      steps[2].progress = 100
      steps[2].status = 'completed'
      setGenerationSteps([...steps])

      const file: ProjectFile = {
        name: 'index.html',
        type: 'html',
        content: htmlCode
      }

      setGeneratedFile(file)
      setPreviewHtml(htmlCode)

    } catch (error) {
      console.error('AI generation failed:', error)
      const errorStep = steps.find(s => s.status === 'running')
      if (errorStep) {
        errorStep.status = 'error'
        setGenerationSteps([...steps])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadFile = () => {
    if (!generatedFile) return
    const blob = new Blob([generatedFile.content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = generatedFile.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const openPreviewInNewTab = () => {
    if (!generatedFile) return
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(generatedFile.content)
      newWindow.document.close()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Sark
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {user.username}
              </span>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Generation Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>AI Website Generator</span>
                </CardTitle>
                <CardDescription>
                  Describe your website and let AI create a single HTML file with all code included
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Website Description</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Create a modern portfolio website with a hero section, about page, services, and contact form. Use purple and blue colors with smooth animations..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                    disabled={isGenerating}
                  />
                </div>
                
                <Button 
                  onClick={generateWebsite}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Website
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generation Progress */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Generation Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {generationSteps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {step.status === 'pending' && (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                              )}
                              {step.status === 'running' && (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                              )}
                              {step.status === 'completed' && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              {step.status === 'error' && (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{step.title}</span>
                                <span className="text-xs text-gray-500">{step.progress}%</span>
                              </div>
                              <Progress value={step.progress} className="h-2 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Code Editor and Preview */}
          <div className="space-y-6">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Code Editor & Preview</span>
                  {generatedFile && (
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={downloadFile}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={openPreviewInNewTab}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Preview
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <Tabs defaultValue="code" className="h-full">
                  <TabsList className="mx-6 mb-4">
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Globe className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="h-full px-6 pb-6">
                    <ScrollArea className="h-full">
                      {generatedFile ? (
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
                          {generatedFile.content}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Generate a website to see the preview</p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="preview" className="h-full px-6 pb-6">
                    {previewHtml ? (
                      <div className="h-full border rounded-lg overflow-hidden">
                        <iframe
                          ref={iframeRef}
                          srcDoc={previewHtml}
                          className="w-full h-full border-0"
                          title="Website Preview"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Generate a website to see the preview</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}