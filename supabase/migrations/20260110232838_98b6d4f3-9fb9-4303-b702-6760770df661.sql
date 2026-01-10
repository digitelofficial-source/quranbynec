-- Create table for push notification subscriptions
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  streak_notifications BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

-- Enable Row Level Security
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for anonymous users too)
CREATE POLICY "Anyone can subscribe to notifications" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update own subscriptions" 
ON public.push_subscriptions 
FOR UPDATE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (user_id IS NULL OR auth.uid() = user_id);

-- Create profiles table for storing user streak data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days_read INTEGER DEFAULT 0,
  last_read_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Enable pg_net extension for HTTP requests from cron
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;