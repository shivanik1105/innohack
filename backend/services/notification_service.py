from typing import List, Dict
from worker.models import User, Job, Notification
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for managing user notifications and job alerts"""
    
    def __init__(self):
        pass
    
    def create_job_match_notification(self, user_id: str, job: Job, match_score: float, match_reasons: List[str]):
        """Create notification for job match"""
        try:
            user = User.objects.get(uid=user_id)
            
            # Don't spam users - check if similar notification exists recently
            recent_notifications = Notification.objects.filter(
                user=user,
                type='job_match',
                job=job,
                createdAt__gte=timezone.now() - timedelta(hours=24)
            )
            
            if recent_notifications.exists():
                return None
            
            title = f"🎯 Perfect Job Match: {job.title}"
            message = f"Found a {int(match_score * 100)}% match job in {job.location}. "
            if match_reasons:
                message += f"Matches: {', '.join(match_reasons[:2])}"
            
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='job_match',
                job=job,
                actionUrl=f'/jobs/{job.id}'
            )
            
            return notification
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for job match notification")
            return None
        except Exception as e:
            logger.error(f"Error creating job match notification: {str(e)}")
            return None
    
    def create_verification_notification(self, user_id: str, verification_type: str, status: str):
        """Create notification for verification updates"""
        try:
            user = User.objects.get(uid=user_id)
            
            if status == 'verified':
                title = f"✅ {verification_type} Verified!"
                message = f"Your {verification_type} has been successfully verified. You now have access to premium jobs!"
            elif status == 'rejected':
                title = f"❌ {verification_type} Verification Failed"
                message = f"Your {verification_type} verification was rejected. Please upload a clearer image or contact support."
            else:
                title = f"⏳ {verification_type} Under Review"
                message = f"Your {verification_type} is being reviewed. We'll notify you once it's processed."
            
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='verification'
            )
            
            return notification
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for verification notification")
            return None
        except Exception as e:
            logger.error(f"Error creating verification notification: {str(e)}")
            return None
    
    def create_rating_notification(self, user_id: str, rating_stars: int, comment: str = ""):
        """Create notification for new rating received"""
        try:
            user = User.objects.get(uid=user_id)
            
            if rating_stars >= 4:
                title = f"⭐ Great Rating Received!"
                message = f"You received a {rating_stars}-star rating! "
            else:
                title = f"📝 New Rating Received"
                message = f"You received a {rating_stars}-star rating. "
            
            if comment:
                message += f"Comment: \"{comment[:50]}{'...' if len(comment) > 50 else ''}\""
            
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='rating'
            )
            
            return notification
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for rating notification")
            return None
        except Exception as e:
            logger.error(f"Error creating rating notification: {str(e)}")
            return None
    
    def create_payment_notification(self, user_id: str, amount: float, job_title: str):
        """Create notification for payment received"""
        try:
            user = User.objects.get(uid=user_id)
            
            title = f"💰 Payment Received!"
            message = f"You received ₹{amount} for completing '{job_title}'. Keep up the great work!"
            
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                type='payment'
            )
            
            return notification
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for payment notification")
            return None
        except Exception as e:
            logger.error(f"Error creating payment notification: {str(e)}")
            return None
    
    def get_user_notifications(self, user_id: str, limit: int = 20, unread_only: bool = False) -> List[Dict]:
        """Get notifications for a user"""
        try:
            user = User.objects.get(uid=user_id)
            
            notifications = Notification.objects.filter(user=user)
            
            if unread_only:
                notifications = notifications.filter(isRead=False)
            
            notifications = notifications.order_by('-createdAt')[:limit]
            
            notification_list = []
            for notification in notifications:
                notification_list.append({
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.type,
                    'isRead': notification.isRead,
                    'createdAt': notification.createdAt.isoformat(),
                    'jobId': notification.job.id if notification.job else None,
                    'actionUrl': notification.actionUrl
                })
            
            return notification_list
            
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found for notifications")
            return []
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            return []
    
    def mark_notification_read(self, notification_id: int, user_id: str) -> bool:
        """Mark a notification as read"""
        try:
            user = User.objects.get(uid=user_id)
            notification = Notification.objects.get(id=notification_id, user=user)
            notification.isRead = True
            notification.save()
            return True
            
        except (User.DoesNotExist, Notification.DoesNotExist):
            return False
        except Exception as e:
            logger.error(f"Error marking notification as read: {str(e)}")
            return False
    
    def mark_all_notifications_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user"""
        try:
            user = User.objects.get(uid=user_id)
            Notification.objects.filter(user=user, isRead=False).update(isRead=True)
            return True
            
        except User.DoesNotExist:
            return False
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {str(e)}")
            return False
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        try:
            user = User.objects.get(uid=user_id)
            return Notification.objects.filter(user=user, isRead=False).count()
            
        except User.DoesNotExist:
            return 0
        except Exception as e:
            logger.error(f"Error getting unread count: {str(e)}")
            return 0
    
    def send_daily_job_alerts(self):
        """Send daily job alerts to users based on their preferences"""
        try:
            # Get all verified users who want job alerts
            users = User.objects.filter(isVerified=True)

            for user in users:
                # Get personalized job recommendations
                try:
                    from services.job_recommendation_service import recommendation_engine
                    recommendations = recommendation_engine.get_recommendations(user.uid, limit=3)

                    if recommendations:
                        # Create a daily digest notification
                        job_titles = [job['title'] for job in recommendations[:2]]
                        title = "🔔 Daily Job Alerts"
                        message = f"Found {len(recommendations)} new jobs for you: {', '.join(job_titles)}"
                        if len(recommendations) > 2:
                            message += f" and {len(recommendations) - 2} more"

                        # Check if daily alert already sent today
                        today_alerts = Notification.objects.filter(
                            user=user,
                            type='job_match',
                            title__contains='Daily Job Alerts',
                            createdAt__date=timezone.now().date()
                        )

                        if not today_alerts.exists():
                            Notification.objects.create(
                                user=user,
                                title=title,
                                message=message,
                                type='job_match'
                            )

                except Exception as e:
                    logger.error(f"Error sending daily alert to user {user.uid}: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error in daily job alerts: {str(e)}")

    def send_relevant_job_notifications(self, user_id: str):
        """Send notifications for relevant job opportunities"""
        try:
            from services.job_recommendation_service import recommendation_engine

            # Get top 5 job recommendations
            recommendations = recommendation_engine.get_recommendations(user_id, limit=5)

            for job_data in recommendations:
                if job_data['score'] > 0.7:  # Only high-scoring matches
                    self.create_job_match_notification(
                        user_id,
                        job_data,
                        job_data['score'],
                        job_data.get('match_reasons', [])
                    )

        except Exception as e:
            logger.error(f"Error sending relevant job notifications: {str(e)}")

    def create_welcome_notifications(self, user_id: str):
        """Create welcome notifications for new users"""
        try:
            user = User.objects.get(uid=user_id)

            # Welcome notification
            welcome_notification = Notification.objects.create(
                user=user,
                title="🎉 Welcome to WorkerConnect!",
                message="Complete your profile verification to access premium job opportunities and increase your earning potential.",
                type='general'
            )

            # Profile completion notification
            profile_notification = Notification.objects.create(
                user=user,
                title="📋 Complete Your Profile",
                message="Upload certificates and work samples to showcase your skills and get better job matches.",
                type='verification'
            )

            return [welcome_notification, profile_notification]

        except Exception as e:
            logger.error(f"Error creating welcome notifications: {str(e)}")
            return []
    
    def cleanup_old_notifications(self, days_old: int = 30):
        """Clean up old notifications"""
        try:
            cutoff_date = timezone.now() - timedelta(days=days_old)
            deleted_count = Notification.objects.filter(createdAt__lt=cutoff_date).delete()[0]
            logger.info(f"Cleaned up {deleted_count} old notifications")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning up notifications: {str(e)}")
            return 0

# Global instance
notification_service = NotificationService()
