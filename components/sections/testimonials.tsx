"use client"

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Amina Hassan',
    role: 'Fashion Enthusiast',
    location: 'Nairobi, Kenya',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
    rating: 5,
    content: 'ADAZE has completely transformed how I shop for clothes in Kenya. The quality verification system gives me confidence, and the prices are unbeatable. I\'ve found so many unique pieces from traders across the country!',
    userType: 'Buyer'
  },
  {
    id: 2,
    name: 'John Mukasa',
    role: 'Mitumba Trader',
    location: 'Mombasa, Kenya',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    rating: 5,
    content: 'As a trader in Mombasa, ADAZE has expanded my customer base to all 47 counties in Kenya. The platform is easy to use, and M-Pesa integration is seamless. My sales have increased by 300%!',
    userType: 'Trader'
  },
  {
    id: 3,
    name: 'Grace Wanjiku',
    role: 'University Student',
    location: 'Eldoret, Kenya',
    avatar: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg',
    rating: 5,
    content: 'Perfect for my student budget! I can find stylish clothes at affordable prices from traders in Nairobi and get them delivered to Eldoret. The delivery is always on time, and the condition descriptions are very accurate.',
    userType: 'Buyer'
  },
  {
    id: 4,
    name: 'Samuel Ochieng',
    role: 'Delivery Partner',
    location: 'Kisumu, Kenya',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    rating: 5,
    content: 'Working with ADAZE as a transporter in Western Kenya has been rewarding. The logistics system is well-organized, and I appreciate the fair compensation. It\'s a reliable source of income covering multiple counties.',
    userType: 'Transporter'
  },
  {
    id: 5,
    name: 'Fatima Mwangi',
    role: 'Small Business Owner',
    location: 'Nakuru, Kenya',
    avatar: 'https://images.pexels.com/photos/3763200/pexels-photo-3763200.jpeg',
    rating: 5,
    content: 'I source inventory for my boutique in Nakuru through ADAZE. The variety from traders across Kenya is incredible, and I can filter by specific criteria. It has helped me offer diverse options to my customers.',
    userType: 'Buyer'
  },
  {
    id: 6,
    name: 'David Kimani',
    role: 'Fashion Reseller',
    location: 'Thika, Kenya',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    rating: 5,
    content: 'The M-Pesa payment system gives both buyers and sellers peace of mind. I\'ve built trust with customers from Mombasa to Kisumu that I\'ve never met in person. ADAZE truly connects all of Kenya!',
    userType: 'Trader'
  }
];

const getUserTypeColor = (type: string) => {
  switch (type) {
    case 'Trader': return 'bg-primary text-primary-foreground';
    case 'Transporter': return 'bg-accent text-accent-foreground';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

export function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            What Kenyans Say About ADAZE
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Real stories from traders, buyers, and transporters across all 47 counties in Kenya
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm card-shadow hover:card-shadow-lg">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-muted-foreground leading-relaxed italic text-sm sm:text-base">
                      "{testimonial.content}"
                    </blockquote>

                    {/* User info */}
                    <div className="flex items-center space-x-3 pt-4 border-t">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                          <p className="font-semibold text-sm truncate">{testimonial.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getUserTypeColor(testimonial.userType)}`}>
                            {testimonial.userType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                        <p className="text-xs text-muted-foreground truncate">{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Join thousands of satisfied users across Kenya
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity h-12 mobile-button"
            >
              Start Your Journey in Kenya
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors h-12 mobile-button"
            >
              Read More Stories
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}