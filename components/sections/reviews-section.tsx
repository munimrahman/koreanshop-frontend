"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getReviews, getReviewStatistics, type Review, type ReviewStatistics } from '@/lib/api/review';

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [currentReview, setCurrentReview] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both reviews and statistics concurrently
        const [reviewsResponse, statisticsResponse] = await Promise.all([
          getReviews({
            // rating: 4, // Only get 4+ star reviews for the showcase
            limit: 6,
            sortBy: 'createdAt',
            sortOrder: 'desc',
            hasComment: true // Only reviews with comments
          }),
          getReviewStatistics()
        ]);

        setReviews(reviewsResponse.reviews);
        setStatistics(statisticsResponse);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty state or keep loading state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      const timer = setInterval(() => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [reviews.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 ${
          star <= rating 
            ? 'fill-primary text-primary' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateSatisfactionRate = () => {
    if (!statistics) return 0;
    const { ratingDistribution, totalReviews } = statistics;
    const positiveReviews = (ratingDistribution['4'] || 0) + (ratingDistribution['5'] || 0);
    return totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-primary-50 dark:from-gray-800 to-orange-50 dark:to-gray-900 py-16">
        <div className="mx-auto px-4 container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl golden-text">
              What Our Customers Say
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Loading customer reviews...
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <Card className="border-primary-200 h-80 md:h-64 animate-pulse glass-effect">
              <CardContent className="flex flex-col justify-center p-8 h-full">
                <div className="bg-gray-200 dark:bg-gray-700 mx-auto mb-4 rounded w-3/4 h-4"></div>
                <div className="bg-gray-200 dark:bg-gray-700 mx-auto mb-8 rounded w-1/2 h-4"></div>
                <div className="flex justify-center items-center gap-4">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-12"></div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded w-32 h-4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-gradient-to-br from-primary-50 dark:from-gray-800 to-orange-50 dark:to-gray-900 py-16">
        <div className="mx-auto px-4 container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl golden-text">
              What Our Customers Say
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Be the first to share your experience with our products!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-primary-50 dark:from-gray-800 to-orange-50 dark:to-gray-900 py-16">
      <div className="mx-auto px-4 container">
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl golden-text">
            What Our Customers Say
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Don't just take our word for it. Here's what our satisfied customers have to say about their experience.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="relative md:h-64">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="md:absolute md:inset-0"
              >
                <Card className="border-primary-200 h-auto md:h-full glass-effect">
                  <CardContent className="flex flex-col justify-start md:justify-center p-5 sm:p-6 md:p-8 h-auto md:h-full">
                    <div className="mb-6 text-center">
                      <Quote className="mx-auto mb-4 w-8 h-8 text-primary-400" />
                      <p className="mx-auto max-w-3xl break-words text-gray-700 dark:text-gray-300 text-base sm:text-lg md:text-xl italic leading-relaxed">
                        "{reviews[currentReview].comment}"
                      </p>
                    </div>
                    
                    <div className="flex md:flex-row flex-col justify-center items-center gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary-100 text-primary-700">
                            {getInitials(reviews[currentReview].customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="md:text-left text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {reviews[currentReview].customerName}
                          </p>
                          <p className="max-w-[17rem] sm:max-w-xs break-words text-muted-foreground text-sm">
                            {reviews[currentReview].productName}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(reviews[currentReview].createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {renderStars(reviews[currentReview].rating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentReview ? 'bg-primary-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="gap-8 grid grid-cols-1 md:grid-cols-3 mt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-2 font-bold text-3xl md:text-4xl golden-text">
                {statistics.totalReviews.toLocaleString()}+
              </div>
              <p className="text-muted-foreground">Happy Customers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="mb-2 font-bold text-3xl md:text-4xl golden-text">
                {Math.round(statistics.averageRating * 10) / 10}
              </div>
              <p className="text-muted-foreground">Average Rating</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="mb-2 font-bold text-3xl md:text-4xl golden-text">
                {calculateSatisfactionRate()}%
              </div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}