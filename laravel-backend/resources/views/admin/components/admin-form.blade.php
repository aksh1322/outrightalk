{{--
    DOCUMENTATION - Somnath Mukherjee
    -------------------------------------------------------------------------------------------------

    1. Include Scripts into form:
        If you want to include scripts into form, 
        Enter below script into your form array element.

        You may pass either script file location.
        'include_scripts' => '<script src="'. asset('your-script-location.js'). '"></script>',

        Or, your custom script.
        'include_scripts' => '<script type="text/javascript">
            $(document).ready(function () {
                your script
            });
        </script>', 

    2. Custom Buttons:
        If you want to show custom buttons instead of
        this form's inbuild button, Enter below script
        into your form array element.

        'custom_buttons' => [
            [
                'type'          => 'submit',
                'text'          => \Config::get('settings.icon_save') . ' <span>Save Changes</span>',
                'attributes'    => [
                    'class'     => 'btn bg-indigo btn-lg waves-effect',
                    'id'        => 'submit-button-id'
                ]
            ],
            [
                'type'          => 'button',
                'text'          => \Config::get('settings.icon_back') . ' <span>Back</span>',
                'attributes'    => [
                    'class'     => 'btn bg-info btn-lg waves-effect',
                    'id'        => 'back-button-id',
                    'onclick'   => 'your custom script'
                ]
            ]
        ],

    3. Supported input types are:
        text:
            'input_field_name' => [
                'type'          => 'text',
                'label'         => 'Field name',
                'value'         => 'Your default value',
                'attributes'    => [
                    'required'      => true,
                    'label_width'   => 'col-lg-2 col-md-2 col-sm-12 col-xs-12'
                    'field_width'   => 'col-lg-6 col-md-6 col-sm-12 col-xs-12'
                ],
                'help'          => 'Extra help text, below your field name.',
                'row_width'     => 'custom-row-class' // Default "row clearfix"
            ]
        textarea: 
        editor:
        radio:
        checkbox:
        select:
        multiselect: 
        email: 
        number:
        date:
        time:
        datetime:
        switch:
        file:
        custom:
        html:
            METHOD 1: 
                'html_group_name'  => [
                    'type'          => 'html',
                    'value'         => '<h4>Your custom html</h4>',
                ],
                
            METHOD 2:
                $html = view('your-folder.your-blade', compact(
                            'your-data'
                        ))
                        ->render();

                'html_group_name'  => [
                    'type'          => 'html',
                    'value'         => $html,
                ],
        hidden:
        include: 
--}}
@extends('admin.layouts.layout', ['title' => $module])
@section('content')
<div class="body">
    @include('admin.components.admin-form-wrapper')
</div>

@endsection