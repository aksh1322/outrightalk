<div class="col-lg-12 col-xs-12 col-sm-12 col-md-12 m-t-15">
    <div class="col-lg-3 col-md-3 col-sm-5 col-xs-12">
        <div class="row">
            <div class="card profile-card">
                <div class="profile-header">&nbsp;</div>
                <div class="profile-body">
                    <div class="image-area">
                        <img src="{{ $data->avatar['thumb'] }}" alt="{{ $data->full_name }} - Profile Image" height="120"/>
                    </div>
                    <div class="content-area">
                        <h3>{{ $data->full_name }}</h3>
                        <p>{{ $data->username }}</p>
                        <p>{{ implode(', ', $roles) }}</p>
                    </div>
                </div>
                <div class="profile-footer">
                    <ul>
                        <li>
                            <span>Followers</span>
                            <span>1.234</span>
                        </li>
                        <li>
                            <span>Following</span>
                            <span>1.201</span>
                        </li>
                        <li>
                            <span>Friends</span>
                            <span>14.252</span>
                        </li>
                    </ul>
                    <button class="btn btn-primary btn-lg waves-effect btn-block">FOLLOW</button>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-9 col-md-9 col-sm-7 col-xs-12">
        <div class="card">
            <div class="card-body">
                
                <div class="form-group">
                    <strong>Name:</strong>
                    {{ $data->full_name }}
                </div>
                <div class="form-group">
                    <strong>Email:</strong>
                    {{ $data->email }}
                </div>
            </div> 
        </div>
    </div>
    
</div>
