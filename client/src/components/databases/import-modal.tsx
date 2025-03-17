import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/lib/api-client'
import React from 'react'

interface NotionDatabase {
  id: string
  title: string
  workspaceName: string
  icon?: string
}

export function ImportDatabaseModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch available Notion databases only when modal is open
  const { data: databases, isLoading } = useQuery<NotionDatabase[]>({
    queryKey: ['notion-available-databases'],
    queryFn: async () => {
      console.log('Fetching available databases');
      return await apiClient.get('/notion/available-databases')
    },
    enabled: isOpen // Only fetch when modal is open
  })

  // Reset selected database when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedDatabase(null)
    }
  }, [isOpen])

  // Import database mutation
  const importMutation = useMutation({
    mutationFn: async (databaseId: string) => {
      return await apiClient.post('/databases/import', { databaseId })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Database imported successfully',
        variant: 'success'
      })
      // Invalidate the databases query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['databases'] })
      onClose()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to import database. Please try again.',
        variant: 'destructive',
      })
    }
  })

  const handleImport = () => {
    if (selectedDatabase) {
      importMutation.mutate(selectedDatabase)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed bg-white z-[100] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Notion Database</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading && (
            <div className="text-center py-8">
              <p>Loading available databases...</p>
            </div>
          )}
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {databases?.map((database) => (
              <div
                key={database.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDatabase === database.id 
                    ? 'border-primary bg-secondary' 
                    : 'hover:bg-secondary/50'
                }`}
                onClick={() => setSelectedDatabase(database.id)}
              >
                <div className="flex items-center gap-2">
                  {database.icon && <span>{database.icon}</span>}
                  <div>
                    <div className="font-medium">{database.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {database.workspaceName}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {databases?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No available databases found
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!selectedDatabase || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 