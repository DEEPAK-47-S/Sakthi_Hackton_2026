# Mock extensions for frontend demo

class MockExtension:
    def init_app(self, app, *args, **kwargs):
        pass

class MockLoginManager:
    def init_app(self, app):
        pass
    def user_loader(self, func):
        return func
    
    @property
    def login_view(self):
        pass
    
    @login_view.setter
    def login_view(self, val):
        pass
        
    @property
    def login_message_category(self):
        pass
        
    @login_message_category.setter
    def login_message_category(self, val):
        pass

db = MockExtension()
migrate = MockExtension()
login_manager = MockLoginManager()
csrf = MockExtension()

@login_manager.user_loader
def load_user(user_id):
    return None
