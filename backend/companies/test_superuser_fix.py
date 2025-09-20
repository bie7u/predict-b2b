from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Company

User = get_user_model()


class SuperuserFixTest(TestCase):
    """Test that superusers can exist without a company assignment."""
    
    def setUp(self):
        """Set up test data."""
        # Create a test company
        self.company = Company.objects.create(name="Test Company")
        
        # Create a regular user with company
        self.regular_user = User.objects.create_user(
            username="regular",
            password="testpass123",
            company=self.company
        )
        
        # Create a superuser without company
        self.superuser = User.objects.create_superuser(
            username="admin",
            password="admin123",
            email="admin@test.com"
        )
    
    def test_superuser_can_exist_without_company(self):
        """Test that superuser can be created without company assignment."""
        self.assertIsNone(self.superuser.company)
        self.assertTrue(self.superuser.is_superuser)
        self.assertTrue(self.superuser.is_staff)
    
    def test_regular_user_has_company(self):
        """Test that regular users still require company assignment."""
        self.assertIsNotNone(self.regular_user.company)
        self.assertEqual(self.regular_user.company, self.company)
        self.assertFalse(self.regular_user.is_superuser)
    
    def test_superuser_str_representation(self):
        """Test that superuser __str__ method handles None company."""
        expected = "admin - (System Admin)"
        self.assertEqual(str(self.superuser), expected)
    
    def test_regular_user_str_representation(self):
        """Test that regular user __str__ method still works."""
        expected = "regular - Test Company"
        self.assertEqual(str(self.regular_user), expected)
    
    def test_user_with_no_company_and_not_superuser_str(self):
        """Test __str__ method for non-superuser with no company."""
        user = User.objects.create_user(
            username="nocompany",
            password="testpass123"
        )
        # This should return just the username
        self.assertEqual(str(user), "nocompany")