from django import forms
from django.contrib.auth.forms import AuthenticationForm
from .models import Compte, Client, Prestataire, Service, Reservation, Evaluation, Paiement, Categorie, Atelier


class InscriptionClientForm(forms.ModelForm):
    """Formulaire d'inscription client avec validation"""
    
    first_name = forms.CharField(
        label="Prénom",
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre prénom'
        })
    )
    
    last_name = forms.CharField(
        label="Nom",
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre nom'
        })
    )
    
    password = forms.CharField(
        label="Mot de passe",
        required=True,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Créer un mot de passe'
        })
    )

    def clean_specialite(self):
        # Enregistre dans Prestataire.specialite (CharField) le nom de la catégorie
        specialite = self.cleaned_data.get('specialite')
        if hasattr(specialite, 'nom'):
            return specialite.nom
        return specialite


    class Meta:
        model = Compte
        fields = ['username', 'email', 'telephone', 'adresse']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom d\'utilisateur'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'votre@email.com'
            }),
            'telephone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '22890000000'
            }),
            'adresse': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Votre adresse'
            }),
        }


class InscriptionPrestataireForm(forms.ModelForm):
    """Formulaire d'inscription prestataire"""
    
    first_name = forms.CharField(
        label="Prénom",
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre prénom'
        })
    )
    
    last_name = forms.CharField(
        label="Nom",
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre nom'
        })
    )
    
    numero_flooz = forms.CharField(
        label="Numéro Flooz",
        max_length=15,
        required=True,
        help_text="Numéro pour recevoir paiements Flooz (*155#)",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '97430290'
        })
    )
    
    numero_mix = forms.CharField(
        label="Numéro Mix by Yas",
        max_length=15,
        required=True,
        help_text="Numéro pour recevoir paiements Mix (*145#)",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '93354922'
        })
    )
    
    specialite = forms.ModelChoiceField(
        label="Spécialité",
        queryset=Categorie.objects.all(),
        required=True,
        empty_label=None,
        widget=forms.Select(attrs={'class': 'form-select'}),
    )
    
    password = forms.CharField(
        label="Mot de passe",
        required=True,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Créer un mot de passe'
        })
    )

    class Meta:
        model = Compte
        fields = ['username', 'email', 'telephone', 'adresse']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom d\'utilisateur'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'votre@email.com'
            }),
            'telephone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '22890000000'
            }),
            'adresse': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Votre adresse'
            }),
        }


class ServiceForm(forms.ModelForm):
    """Formulaire pour créer/modifier un service"""

    class Meta:
        model = Service
        fields = ['nom', 'categorie', 'description', 'prix', 'disponibilite']
        widgets = {
            'nom': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: Installation plomberie'
            }),
            'categorie': forms.Select(attrs={
                'class': 'form-select'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Décrivez votre service en détail...'
            }),
            'prix': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Prix en Fcfa'
            }),
            'disponibilite': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }


class EvaluationForm(forms.ModelForm):
    """Formulaire d'évaluation d'un service"""

    class Meta:
        model = Evaluation
        fields = ['note', 'commentaire']
        widgets = {
            'note': forms.Select(
                choices=[(i, f"{i} ★") for i in range(1, 6)],
                attrs={'class': 'form-select'}
            ),
            'commentaire': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Partagez votre expérience...'
            }),
        }


class ReservationForm(forms.ModelForm):
    """Formulaire de réservation"""

    class Meta:
        model = Reservation
        fields = ['montant']
        widgets = {
            'montant': forms.NumberInput(attrs={
                'readonly': True,
                'class': 'form-control'
            }),
        }


class PaiementForm(forms.ModelForm):
    """Formulaire de paiement avec split automatique"""

    class Meta:
        model = Paiement
        fields = ['methode', 'numero_client', 'numero_prestataire', 'numero_admin', 'transaction_ref']
        widgets = {
            'methode': forms.Select(
                choices=[
                    ('flooz', 'Flooz (*155#)'),
                    ('tmoney', 'Mix by Yas (*145#)')
                ],
                attrs={'class': 'form-select'}
            ),
            'numero_client': forms.TextInput(attrs={
                'class': 'form-control',
                'readonly': True,
                'placeholder': 'Votre numéro Flooz/Mix'
            }),
            'numero_prestataire': forms.TextInput(attrs={
                'class': 'form-control',
                'readonly': True,
                'placeholder': 'Numéro prestataire'
            }),
            'numero_admin': forms.TextInput(attrs={
                'class': 'form-control',
                'readonly': True,
                'placeholder': 'Numéro admin (frais)'
            }),
            'transaction_ref': forms.TextInput(attrs={
                'class': 'form-control',
                'readonly': True,
                'placeholder': 'REF auto-générée'
            }),
        }

    def __init__(self, *args, **kwargs):
        self.montant_prestataire = kwargs.pop('montant_prestataire', 0)
        self.montant_frais = kwargs.pop('montant_frais', 0)
        self.montant_total = kwargs.pop('montant_total', 0)
        self.numero_prestataire = kwargs.pop('numero_prestataire', '')
        self.numero_client = kwargs.pop('numero_client', '')
        self.numero_admin = kwargs.pop('numero_admin', '')
        self.transaction_ref = kwargs.pop('transaction_ref', '')
        super().__init__(*args, **kwargs)
        self.fields['numero_client'].initial = self.numero_client
        self.fields['numero_prestataire'].initial = self.numero_prestataire
        self.fields['numero_admin'].initial = self.numero_admin
        self.fields['transaction_ref'].initial = self.transaction_ref


class LoginForm(AuthenticationForm):
    """Formulaire de connexion"""
    
    username = forms.CharField(
        label="Nom d'utilisateur",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre nom d\'utilisateur'
        })
    )
    
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Votre mot de passe'
        })
    )


class AtelierForm(forms.ModelForm):
    """Formulaire pour créer/modifier un atelier"""
    
    class Meta:
        model = Atelier
        fields = ['nom', 'adresse', 'latitude', 'longitude', 'telephone', 'description', 'est_actif']
        widgets = {
            'nom': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: Atelier Principal, Agence downtown...'
            }),
            'adresse': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 2,
                'placeholder': 'Adresse complète de l\'atelier'
            }),
            'latitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: 6.125580',
                'step': '0.000001'
            }),
            'longitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ex: 1.232456',
                'step': '0.000001'
            }),
            'telephone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '22890000000'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Description supplémentaire de l\'atelier...'
            }),
            'est_actif': forms.CheckboxInput(attrs={
                'class': 'form-check-input'
            }),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        latitude = cleaned_data.get('latitude')
        longitude = cleaned_data.get('longitude')
        
        # Validation des coordonnées pour le Togo
        if latitude and longitude:
            if not (6.0 <= latitude <= 11.5):
                raise forms.ValidationError("La latitude doit être comprise entre 6.0 et 11.5 (Togo)")
            if not (-1.0 <= longitude <= 2.5):
                raise forms.ValidationError("La longitude doit être comprise entre -1.0 et 2.5 (Togo)")
        
        return cleaned_data

