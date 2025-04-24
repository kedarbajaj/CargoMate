
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [feedbackType, setFeedbackType] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error(t('feedback.fillAllFields'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Store feedback in notifications table since we don't have a dedicated feedback table
      const { error: dbError } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id || null,
          message: `Feedback (${feedbackType}): ${subject} - from ${name} (${email})`,
          status: 'unread'
        });
      
      if (dbError) throw dbError;
      
      // Send an email to the admin
      const { error: emailError } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          name,
          email,
          feedbackType,
          subject,
          message,
          adminEmail: 'kedarbajaj3785@gmail.com'
        }
      });
      
      if (emailError) throw emailError;
      
      toast.success(t('feedback.thankYou'));
      setSubject('');
      setMessage('');
      setFeedbackType('general');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-[#3B2F2F]">{t('feedback.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('feedback.subtitle')}</p>
      
      <Card className="border-[#C07C56] bg-[#FAF3E0]">
        <CardHeader>
          <CardTitle className="text-[#6F4E37]">{t('feedback.formTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('feedback.name')}</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#C07C56] bg-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('feedback.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[#C07C56] bg-white"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedbackType">{t('feedback.type')}</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="border-[#C07C56] bg-white">
                  <SelectValue placeholder={t('feedback.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('feedback.typeGeneral')}</SelectItem>
                  <SelectItem value="bug">{t('feedback.typeBug')}</SelectItem>
                  <SelectItem value="feature">{t('feedback.typeFeature')}</SelectItem>
                  <SelectItem value="complaint">{t('feedback.typeComplaint')}</SelectItem>
                  <SelectItem value="praise">{t('feedback.typePraise')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">{t('feedback.subject')}</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="border-[#C07C56] bg-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">{t('feedback.message')}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-[#C07C56] bg-white h-32"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="bg-[#C07C56] hover:bg-[#6F4E37] text-white w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting') : t('feedback.submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackPage;
