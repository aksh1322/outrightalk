@extends('admin.layouts.layout-login')
@section('content')
   <div class="container">
       <div class="loan_signup">
        @include('admin.components.messages')
        <form method="POST" action="{{ route('register') }}">
            @csrf
            <h3><i class="fa fa-power-off" aria-hidden="true"></i> Loan Officer Sign Up</h3>
            <div class="row">
                <div class="col-md-6 col-lg-6">
                    <label class="input_label">Company / Bank Name <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="text" name="company_name" class="form-control{{ $errors->has('company_name') ? ' is-invalid' : '' }}" id="inlineFormInputGroup" placeholder="Company / Bank Name" value="{{ old('company_name') }}">
                        @if ($errors->has('name'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('company_name') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
                <div class="col-md-6 col-lg-6">
                    <label class="input_label">Your Name <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="text" name="name" class="form-control{{ $errors->has('name') ? ' is-invalid' : '' }}" id="inlineFormInputGroup" placeholder="Your Name" value="{{ old('name') }}">
                        @if ($errors->has('name'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('name') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-lg-6">
                    <label class="input_label">NMLS <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="text" name="mmls" class="form-control{{ $errors->has('mmls') ? ' is-invalid' : '' }}" id="inlineFormInputGroup" placeholder="NMLS"  value="{{ old('mmls') }}">
                        @if ($errors->has('mmls'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('mmls') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
                <div class="col-md-6 col-lg-6">
                    <label class="input_label">Country <sup>*</sup></label>
                    <div class="input-group mb-3">
                        {{Form::select('country_id', $countries ,null , ['placeholder' => "Select Country", "class" => 'form-control' . ($errors->has('country_id') ? ' is-invalid' : '')])}}
                        @if ($errors->has('name'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('country_id') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
            </div>
            <div class="row">
                 <div class="col-md-6 col-lg-6">
                    <label class="input_label">Phone <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control{{ $errors->has('phone') ? ' is-invalid' : '' }}" name="phone" value="{{ old('phone') }}" id="inlineFormInputGroup" placeholder="Phone">
                        @if ($errors->has('phone'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('phone') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
                <div class="col-md-6 col-lg-6">
                    <label class="input_label">Email <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="text" class="form-control{{ $errors->has('email') ? ' is-invalid' : '' }}" name="email" value="{{ old('email') }}" id="inlineFormInputGroup" placeholder="Email">
                        @if ($errors->has('email'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('email') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6 col-lg-6">
                   <label class="input_label">Password <sup>*</sup></label>
                   <div class="input-group mb-3">
                        <input type="password" class="form-control{{ $errors->has('password') ? ' is-invalid' : '' }}" name="password" id="inlineFormInputGroup" placeholder="Password">
                        @if ($errors->has('password'))
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $errors->first('password') }}</strong>
                            </span>
                        @endif
                   </div>
               </div>
               <div class="col-md-6 col-lg-6">
                    <label class="input_label">Re-enter Password <sup>*</sup></label>
                    <div class="input-group mb-3">
                        <input type="password" class="form-control" id="inlineFormInputGroup" name="password_confirmation" placeholder="Re-enter Password">
                    </div>
               </div>
            </div>
            <div class="text-center mt-3">
                <button type="submit" class="sign_upbtn">Sign Up <i class="fa fa-angle-right" aria-hidden="true"></i></button>
                <a href="{{ route('login') }}" class="already_register">Already Registered?</a>
            </div>
        </form>
       </div>
   </div>
@endsection
