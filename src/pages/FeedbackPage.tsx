
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const feedbackFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  feedbackType: z.string(),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters" }),
  message: z.string().min(10, { message: "Feedback must be at least 10 characters" }),
  rating: z.string(),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      feedbackType: 'general',
      subject: '',
      message: '',
      rating: '5',
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store feedback in notifications table since we don't have a dedicated feedback table
      const { error: dbError } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id || null,
          message: `Feedback (${values.feedbackType}): ${values.subject} - from ${values.name} (${values.email}) - Rating: ${values.rating}/5`,
          status: 'unread'
        });
      
      if (dbError) throw dbError;
      
      // Send an email to the admin
      const { error: emailError } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name: values.name,
          email: values.email,
          feedbackType: values.feedbackType,
          subject: values.subject,
          message: values.message,
          rating: values.rating,
          adminEmail: 'kedarbajaj3785@gmail.com'
        }
      });
      
      if (emailError) throw emailError;
      
      toast.success(t('feedback.thankYou'));
      form.reset({
        name: values.name,
        email: values.email,
        feedbackType: 'general',
        subject: '',
        message: '',
        rating: '5',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-cargomate-700 dark:text-cargomate-300">{t('feedback.title')}</h1>
        <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">{t('feedback.subtitle')}</p>
      </div>
      
      <Card className="border-cargomate-300 bg-gradient-to-br from-white to-cargomate-50 dark:from-cargomate-900 dark:to-cargomate-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-cargomate-700 dark:text-cargomate-300">{t('feedback.formTitle')}</CardTitle>
          <CardDescription>{t('feedback.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('feedback.namePlaceholder')}
                          className="border-cargomate-300 dark:border-cargomate-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('feedback.emailPlaceholder')}
                          className="border-cargomate-300 dark:border-cargomate-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="feedbackType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.type')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-cargomate-300 dark:border-cargomate-600">
                            <SelectValue placeholder={t('feedback.selectType')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">{t('feedback.typeGeneral')}</SelectItem>
                          <SelectItem value="bug">{t('feedback.typeBug')}</SelectItem>
                          <SelectItem value="feature">{t('feedback.typeFeature')}</SelectItem>
                          <SelectItem value="complaint">{t('feedback.typeComplaint')}</SelectItem>
                          <SelectItem value="praise">{t('feedback.typePraise')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('feedback.subject')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('feedback.subjectPlaceholder')}
                          className="border-cargomate-300 dark:border-cargomate-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('feedback.message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('feedback.messagePlaceholder')}
                        className="border-cargomate-300 dark:border-cargomate-600 h-32 resize-none md:h-40"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('feedback.rating')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4 justify-between md:justify-start md:gap-8"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <div className="flex items-center space-x-2" key={rating}>
                            <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                            <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>{t('feedback.ratingDescription')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="w-full bg-cargomate-500 hover:bg-cargomate-600 dark:bg-cargomate-400 dark:hover:bg-cargomate-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.submitting') : t('feedback.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col space-y-4 border-t border-cargomate-200 dark:border-cargomate-700 pt-6">
          <p className="text-sm text-muted-foreground text-center">{t('feedback.privacyNotice')}</p>
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm" className="text-xs">{t('feedback.termsOfService')}</Button>
            <Button variant="ghost" size="sm" className="text-xs">{t('feedback.privacyPolicy')}</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeedbackPage;
