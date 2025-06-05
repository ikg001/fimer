import React from 'react'
import { Card, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { StarIcon } from 'lucide-react'

interface ComplaintCardProps {
  id: string
  title: string
  description: string
  category: string
  status: 'pending' | 'in-progress' | 'resolved'
  date: string
  rating?: number
  onView: (id: string) => void
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  id,
  title,
  description,
  category,
  status,
  date,
  rating,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede'
      case 'in-progress':
        return 'İşlemde'
      case 'resolved':
        return 'Çözüldü'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge className={getStatusColor(status)}>
            {getStatusText(status)}
          </Badge>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{category}</span>
          <span>{date}</span>
        </div>
        {rating && (
          <div className="flex items-center mt-4">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                className={`w-4 h-4 ${
                  index < rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onView(id)}
        >
          Detayları Gör
        </Button>
      </CardFooter>
    </Card>
  )
} 