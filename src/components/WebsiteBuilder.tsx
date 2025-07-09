import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Code, 
 
  Download, 
  Settings, 
  LogOut, 
  Zap, 
  FileText,
  Globe,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface User {
  email: string
  username: string
}

interface WebsiteBuilderProps {
  user: User
  onLogout: () => void
}

export function WebsiteBuilder({ user, onLogout }: WebsiteBuilderProps) {
  const { theme, toggleTheme } = useTheme()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedHtml('')
    // This is where the call to the backend function will be made.
    // For now, I will keep the simulation logic and add the real logic later.
    await simulateGeneration();
  }

  const simulateGeneration = async () => {
    // This function will be replaced with the actual API call
    const mockHtml = `<!DOCTYPE html><html><body><h1>Hello, World!</h1></body></html>`;
    setGeneratedHtml(mockHtml);
    setIsGenerating(false);
  }

  const openPreviewInNewTab = () => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }
  };

  const copyToClipboard = () => {
    if (generatedHtml) {
      navigator.clipboard.writeText(generatedHtml);
      // You can add a toast notification here to confirm copy
    }
  };

  const downloadFile = () => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'index.html'
      a.click()
      URL.revokeObjectURL(url)
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
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
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
                  Describe your website and let AI create it for you
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
                  />
                </div>
                
                <Button 
                  onClick={handleGenerate}
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

            {/* Generated Files */}
            {generatedHtml && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Generated File</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" onClick={downloadFile}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-orange-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium">index.html</span>
                    <Badge variant="secondary" className="ml-auto">
                      HTML
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Code Editor and Preview */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Globe className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                <Tabs defaultValue="code" className="h-full">
                  <TabsContent value="code" className="h-full p-0 m-0">
                    <div className="relative h-full">
                      <ScrollArea className="h-full">
                        {generatedHtml ? (
                          <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{generatedHtml}</pre>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p>Your generated code will appear here</p>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                      {generatedHtml && (
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="h-full p-0 m-0">
                    <div className="relative h-full">
                      {generatedHtml ? (
                        <iframe
                          ref={iframeRef}
                          srcDoc={generatedHtml}
                          className="w-full h-full border-0"
                          title="Website Preview"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Generate a website to see the preview</p>
                          </div>
                        </div>
                      )}
                      {generatedHtml && (
                        <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={openPreviewInNewTab}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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