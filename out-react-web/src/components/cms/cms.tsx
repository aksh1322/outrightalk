import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'react-toastify'
import BannerShow from 'src/components/common/banner';
import { useCommonApi } from 'src/_common/hooks/actions/commonApiCall/appCommonApiCallHook'
import { createMarkup, getCmsTypebasedOnPage } from 'src/_config'

export default function CmsComponent() {

    const commonApi = useCommonApi()
    const { type, slug } = useParams<any>();
    const [cmsContent, setCmsContent] = useState<any>()

    const getCmsContentDetails = () => {
        const params = {
            slug: slug,
            type: getCmsTypebasedOnPage(type)
        }
        commonApi.callCmsContentDetails(params, (message: string, resp: any) => {
            if (resp && resp.list) {
                setCmsContent(resp.list)
            } else {
                setCmsContent(null)
            }
        }, (message: string) => {
            toast.error(message)
        })
    }

    useEffect(() => {
        getCmsContentDetails()
    }, [type, slug])

    return (
        <React.Fragment>
            {
                cmsContent ?
                    <div className="row justify-content-center">
                        <div className="col-sm-12">
                            <div className="page-heading-panel d-flex justify-content-between">
                                <h1>
                                    {
                                        cmsContent && cmsContent.title ? <p dangerouslySetInnerHTML={createMarkup(cmsContent.title)} /> : '--'
                                    }
                                </h1>
                            </div>
                            <div className="cms-content-panel">
                                {
                                    cmsContent && cmsContent.long_description ? <p dangerouslySetInnerHTML={createMarkup(cmsContent.long_description)} /> : '--'
                                }
                            </div>
                        </div>
                    </div>
                    :
                    <div className="row justify-content-center">
                        <div className="cms-content-panel">
                            <p>No content found!</p>
                        </div>
                    </div>
            }

        </React.Fragment>
    )
}