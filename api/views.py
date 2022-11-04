from django.shortcuts import render
from django.http import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import TaskSerializer

from .models import Task

import os
import praw

# Praw Setup
reddit = praw.Reddit(client_id=os.environ.get('reddit_dev_client_id'), client_secret=os.environ.get('reddit_dev_trigger_warning_secret') , username='SKDeveloperAccount', password='SaB79p58fF', user_agent='TriggerWarningv1')


# Sets subreddit to my test subreddit for the app
subreddit = reddit.subreddit('triggerwarningapptest')

# Grabs the top 5 posts from "hot"
hot_mysub = subreddit.hot(limit=10) #Max Limit 50



# Create your views here.

@api_view(['GET'])
def apiOverview(request):
    api_urls = {
        'List':'/word-list/',
        'Detail View':'/word-detail/<str:pk>/',
        'Create':'/word-create/',
        'Update':'/word-update/<str:pk>/',
        'Delete':'/word-delete/<str:pk>/',
        }

    return Response(api_urls)

@api_view(['GET'])
def wordList(request):
    words = Task.objects.all().order_by('-id')
    serializer = TaskSerializer(words, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def wordDetail(request, pk):
    words = Task.objects.get(id=pk)
    serializer = TaskSerializer(words, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def wordCreate(request):
    serializer = TaskSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    user_input = request.data['title']
    postRemove(user_input)

    return Response(serializer.data)

@api_view(['POST'])
def wordUpdate(request, pk):
    word = Task.objects.get(id=pk)
    serializer = TaskSerializer(instance=word, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(['DELETE'])
def wordDelete(request, pk):
    word = Task.objects.get(id=pk)
    word.delete()

    user_input = request.data['title']
    postApprove(user_input)
    
    return Response('Item succsesfully delete!')



# Custom functions
def postRemove(userInput):
    for submission in hot_mysub:
        if userInput in submission.title:

            print(f"Reddit stuff running")

            submission.mod.remove() #Removes post from Subreddit
        
    #         reddit.subreddit("triggerwarningapptest").mod.removal_reasons["110ni21zo23ql"].update(
    # title="TriggerWarning", message="Removed because it contains a BAD WORD")
    #         print('Removal Reason added') 

            submission.mod.send_removal_message(message='Your submission was removed for containing a Trigger Word', title='Submission Removed', type='private') #Sends post removal modmail to post author.
        
            submission.mod.create_note(label="ABUSE_WARNING", note="Removed by TriggerWarning app")
            print(f'Submission {submission.id} was removed for Trigger Warning violatins' ) #Creates note of incident on author's mod notes.


        comments = submission.comments 
        for comment in comments:
            
            if userInput in comment.body:
                comment.mod.remove()
                print(f"Comment {comment.id} has been removed")
            if len(comment.replies) > 0:
                for reply in comment.replies:
                    if userInput in reply.body:
                        reply.mod.remove()
                        print(f'Reply {reply.id} has been hidden')

def postApprove(userInput):
    for submission in hot_mysub:
        if userInput in submission.title:

            print(f"Reddit stuff running")

            submission.mod.approve() #Removes post from Subreddit
        
    #         reddit.subreddit("triggerwarningapptest").mod.removal_reasons["110ni21zo23ql"].update(
    # title="TriggerWarning", message="Removed because it contains a BAD WORD")
    #         print('Removal Reason added') 

            # submission.mod.send_removal_message(message='Your submission was removed for containing a Trigger Word', title='Submission Removed', type='private') #Sends post removal modmail to post author.
        
            # submission.mod.create_note(label="ABUSE_WARNING", note="Removed by TriggerWarning app")
            # print(f'Submission {submission.id} was removed for Trigger Warning violatins' ) #Creates note of incident on author's mod notes.


        comments = submission.comments 
        for comment in comments:
            
            if userInput in comment.body:
                comment.mod.approve()
                print(f"Comment {comment.id} has been removed")
            if len(comment.replies) > 0:
                for reply in comment.replies:
                    if userInput in reply.body:
                        reply.mod.approve()
                        print(f'Reply {reply.id} has been hidden')