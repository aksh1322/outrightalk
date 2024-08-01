<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SiteTemplate extends Model {
	use SoftDeletes;

	protected $table = 'site_templates';

	protected $fillable = [
		'status',
		'template_type',
		'template_name',
		'subject',
		'template_content',
	];

    public $statuses = [
        0=> [
            'id' => 0,
            'name' => 'Disabled',
            'badge' => 'warning'
        ],
        1=> [
            'id' => 1,
            'name' => 'Enabled',
            'badge' => 'success'
        ],
    ];

    public $templateTypes = [
        1 => [
            'id' => 1,
            'name' => 'Email',
            'badge' => 'success'
        ],
        2 => [
            'id' => 2,
            'name' => 'SMS',
            'badge' => 'warning'
        ],
        3 => [
            'id' => 3,
            'name' => 'PDF',
            'badge' => 'danger'
        ],
    ];

	public $orderBy = [];

	public function getFilters() {
		$status         = \App\Helpers\Helper::makeSimpleArray($this->statuses, 'id,name');
		$templateTypes  = \App\Helpers\Helper::makeSimpleArray($this->templateTypes, 'id,name');
		return [
			'reset'  => route('templates.index'),
			'fields' => [
				'template_name' => [
					'type'  => 'text',
					'label' => 'Template Name',
				],
				'template_type' => [
					'type'    => 'select',
					'label'   => 'Template Type',
					'options' => $templateTypes,
				],
		        'status'     => [
                    'type'       => 'select',
                    'label'      => 'Status',
                    'attributes' => [
                        'id' => 'select-status',
                    ],
                    'options'    => $status,
                ],
			],
		];
	}
	public $statusColorCodes = [
		0 => 'warning',
		1 => 'success',
		//2 => 'danger',
		//3 => 'secondary',
		//4 => 'secondary',
		//5 => 'danger',
	];
	public $statusList = [
		0 => 'Disabled',
		1 => 'Enabled',
		//2 => 'Pending acceptance',
		//3 => 'Rejected',
		//4 => 'Blocked',
		//5 => 'Blocked by invalid login attempts',
	];
	public function getListing($srch_params = [], $offset = 0) {
		$listing = self::select(
			$this->table . ".*"
		)
			->when(isset($srch_params['with']), function ($q) use ($srch_params) {
				return $q->with($srch_params['with']);
			})
			->when(isset($srch_params['template_name']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".template_name", "LIKE", "%{$srch_params['template_name']}%");
			})
			->when(isset($srch_params['template_type']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".template_type", $srch_params['template_type']);
			})
			->when(isset($srch_params['status']), function ($q) use ($srch_params) {
				return $q->where($this->table . ".status", $srch_params['status']);
			});

		// if (isset($srch_params['template_type'])) {
		// 	return $listing->where($this->table . '.template_type', '=', $srch_params['template_type'])
		// 		->first();
		// }
		if (isset($srch_params['id'])) {
			return $listing->where($this->table . '.id', '=', $srch_params['id'])
				->first();
		}

		if (isset($srch_params['count'])) {
			return $listing->count();
		}

		if (isset($srch_params['orderBy'])) {
			$this->orderBy = \App\Helpers\Helper::manageOrderBy($srch_params['orderBy']);
			foreach ($this->orderBy as $key => $value) {
				$listing->orderBy($key, $value);
			}
		} else {
			$listing->orderBy($this->table . '.id', 'DESC');
		}

		if ($offset) {
			$listing = $listing->paginate($offset);
		} else {
			$listing = $listing->get();
		}

		return $listing;
	}

	public function store($input = [], $id = 0, $request = null) {
		$status = 200;
		if ($id) {
			$data = $this->getListing(['id' => $id]);

			if (!$data) {
				return \App\Helpers\Helper::resp('Not a valid data', 400);
			}

			$data->update($input);
		} else {
			$status = 201;
			$data   = $this->create($input);
		}

		return \App\Helpers\Helper::resp('Changes has been successfully saved.', $status, $data);
	}

	/**
	 * Attachment array elements should be
	 * path
	 * file_name
	 * file_mime
	 */
	public static function sendMail($toemail, $toName, $data, $template, $attachment = []) {

		$template = self::__getContent($template, $data, 1);

		if (!$template) {
			return false;
		}

		$data    = $template['data'];
		$subject = $template['template']->subject;
		$subject = str_replace('{{site_name}}', \Config::get('settings.company_name'), $subject);
		$subject = str_replace('{{site_url}}', url('/'), $subject);

		\Mail::send('emails.template', $data, function ($m) use ($data, $toemail, $toName, $subject, $attachment) {
			$m->from("welcome@outrightalk.com", "OutrighTalk Messenger and E-learning")
			//$m->from(\Config::get('settings.support_mail'), \Config::get('settings.company_name'))
				->to($toemail, $toName)
				->subject($subject);

			if (!empty($attachment) && $attachment['path']) {
				$m->attach($attachment['path'], [
					'as'   => $attachment['file_name'],
					'mime' => $attachment['file_mime'],
				]);
			}
		});

	}

	public static function generatePDF($template = '', $data = [], $detination_path = '') {
		$template = self::__getContent($template, $data, 3);

		if (!$template) {
			return false;
		}

		$pdf = \PDF::loadView('pdf', $template['data'])->setPaper('a4', 'portrait');
		return $pdf->save(public_path($detination_path));
	}

	private static function __getContent($template = '', $data = [], $template_type = 1) {
		$template = self::where([
			'template_name' => $template,
			'status'        => 1,
			'template_type' => $template_type,
		])
			->first();

		if (!$template) {
			return false;
		}
		$Content = $template->template_type == 2 ? $template->subject : $template->template_content;

		if (!empty($data)) {
			foreach ($data as $key => $value) {
				$Content = str_replace('{{' . $key . '}}', $value, $Content);
			}
		}

		$Content = str_replace('{{site_name}}', \Config::get('settings.company_name'), $Content);
		$Content = str_replace('{{site_url}}', \Config::get('settings.frontend_url'), $Content);
		$Content = str_replace('{{contact_mail}}', \Config::get('settings.contact_mail'), $Content);
		$Content = str_replace('{{contact_phone}}', \Config::get('settings.contact_phone'), $Content);
		$Content = str_replace('{{site_logo}}', \Config::get('settings.frontend_url') . 'assets/images/logo-light.png', $Content);

		$data = [
			'content'       => $Content,
			'site_url'      => \Config::get('settings.frontend_url'),
			'site_logo'     => \Config::get('settings.frontend_url') . 'assets/images/logo-light.png',
			'contact_mail'  => \Config::get('settings.contact_mail'),
			'contact_phone' => \Config::get('settings.contact_phone'),
		];

		return [
			'template' => $template,
			'data'     => $data,
		];
	}
}
