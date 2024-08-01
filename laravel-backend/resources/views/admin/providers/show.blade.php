<div class="card col-md-3 pr-4 pl-4">
    <div class="profile-header">&nbsp;</div>
    <div class="profile-body">
        <div class="image-area">
            <img src="{{ $data->avatar['thumb'] }}" alt="{{ $data->full_name }} - Profile Image" height="120" />
        </div>
        <div class="content-area">
            <h3>{{ $data->full_name }}</h3>
            <p>{{ $data->username }}</p>
            <p>{{ implode(', ', $roles) }}</p>
            <span class="badge badge-pill badge-soft-{{ $data->statusColorCodes[$data->status] }} font-size-12">{!! $data->statusList[$data->status] !!}</span>
        </div>
    </div>
</div>
<div class="card col-md-9 pr-4 pl-4">
    <div class="card-body">
        <div class="row">
            <div class="col-lg-6">
                <div class="card mini-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Name</p>
                                <p class="mb-0">{{ $data->full_name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="card blog-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Email</p>
                                <p class="mb-0">{{ $data->email }}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6">
                <div class="card blog-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Phone</p>
                                <p class="mb-0">{{ $data->phones[0]->phone }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card mini-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Customers</p>
                                <p class="mb-0">{{ count($data->customerMaps) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-6">
                <div class="card blog-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Forms</p>
                                <p class="mb-0">{{ count($data->forms) }}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card blog-stats-wid pr-5 pl-1">
                    <div class="card-body">
                        <div class="d-flex flex-wrap">
                            <div class="mr-3">
                                <p class="text-muted mb-2">Content</p>
                                <p class="mb-0">{{ count($data->contents) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@if($data->status == 3)
<div class="card col-md-12">
    <div class="card-body">
        <strong>Reject Reason</strong>
        <p>{{isset($data->rejectReasons[sizeof($data->rejectReasons) - 1]) ? $data->rejectReasons[sizeof($data->rejectReasons) - 1]->reason : ''}}</p>
    </div>
</div>
@endif