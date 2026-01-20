import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponseDTO } from '../models/auth/user-response.dto';
import { UserRegistrationDTO } from '../models/auth/user-registration.dto';
import { LoginRequestDTO } from '../models/auth/login-request.dto';
import { LoginSuccessDTO } from '../models/auth/login-success.dto';

